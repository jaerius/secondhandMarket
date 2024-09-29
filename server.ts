// server.ts

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import next from 'next';
import { endGame, startGame } from './lib/ethereum';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = 3001;

interface PlayerData {
  roomName: string;
  tapCount: number;
  role: 'buyer' | 'seller'; // 역할 추가
}

const waitingPlayers: { id: string; roomId: string; role: 'buyer' | 'seller' }[] = []; // 방 ID와 역할을 함께 대기열에서 관리
const rooms: { [roomName: string]: string[] } = {};
const players: { [socketId: string]: PlayerData } = {};

nextApp.prepare().then(() => {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // 클라이언트로부터 방 ID와 역할을 전달받음
    socket.on('joinRoom', ({ roomId, role }: { roomId: string; role: 'buyer' | 'seller' }) => {
      waitingPlayers.push({ id: socket.id, roomId, role });
      attemptMatchmaking(socket, io);
    });

    socket.on('tap', () => {
      const roomName = findPlayerRoom(socket.id);
      if (roomName) {
        const playerData = players[socket.id];
        incrementTapCount(socket.id, playerData.role); // 역할에 따라 탭 카운트 업데이트
        const opponentId = getOpponentId(roomName, socket.id);
        const opponentData = players[opponentId];

        // 상대방의 역할에 따라 카운트를 전송
        if (opponentData.role === 'seller') {
          io.to(opponentId).emit('opponentTap', { sellerTapCount: opponentData.tapCount });
        } else {
          io.to(opponentId).emit('opponentTap', { buyerTapCount: opponentData.tapCount });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      handleDisconnect(socket, io);
    });
  });

  app.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

function attemptMatchmaking(socket: Socket, io: Server) {
  const playerData = waitingPlayers.find(p => p.id === socket.id);
  if (!playerData) return;

  const { roomId } = playerData;

  const waitingInRoom = waitingPlayers.filter(p => p.roomId === roomId);
  if (waitingInRoom.length >= 2) {
    const player1 = waitingInRoom[0];
    const player2 = waitingInRoom[1];

    const roomName = `room-${player1.id}-${player2.id}`;
    rooms[roomName] = [player1.id, player2.id];

    const player1Socket = io.sockets.sockets.get(player1.id);
    const player2Socket = io.sockets.sockets.get(player2.id);

    if (player1Socket && player2Socket) {
      player1Socket.join(roomName);
      player2Socket.join(roomName);

      initializePlayerData(player1.id, roomName, player1.role); // 역할 전달
      initializePlayerData(player2.id, roomName, player2.role); // 역할 전달

      io.to(roomName).emit('gameStart');
      startGameTimer(roomName, io, roomId); // roomId 전달

      // 대기열에서 제거
      waitingPlayers.splice(waitingPlayers.indexOf(player1), 1);
      waitingPlayers.splice(waitingPlayers.indexOf(player2), 1);
    } else {
      console.error('Player socket not found during matchmaking.');
    }
  }
}

function initializePlayerData(playerId: string, roomName: string, role: 'buyer' | 'seller') {
  players[playerId] = {
    roomName: roomName,
    tapCount: 0,
    role: role, // 역할 저장
  };
}

function incrementTapCount(playerId: string, role: 'buyer' | 'seller') {
  if (players[playerId]) {
    players[playerId].tapCount++; // Buyer 또는 Seller의 탭 카운트만 증가
  }
}

function getPlayerTapCount(playerId: string): number {
  return players[playerId]?.tapCount || 0;
}

function getOpponentId(roomName: string, playerId: string): string {
  return rooms[roomName].find((id) => id !== playerId)!;
}

function findPlayerRoom(playerId: string): string | null {
  return players[playerId]?.roomName || null;
}

function startGameTimer(roomName: string, io: Server, roomId: string) {
  const GAME_TIME = 13000;
  startGame(roomId); // roomId 전달

  setTimeout(() => {
    io.to(roomName).emit('gameEnd');
    const playerIds = rooms[roomName];
    const results = playerIds.map((id) => ({
      playerId: id,
      tapCount: players[id]?.tapCount || 0,
      role: players[id]?.role // 역할 추가
    }));

    io.to(roomName).emit('gameResult', results);
    cleanupGameData(roomName);
  }, GAME_TIME);
}

function cleanupGameData(roomName: string) {
  const playerIds = rooms[roomName];
  playerIds.forEach((id) => {
    delete players[id];
  });
  delete rooms[roomName];
}

function handleDisconnect(socket: Socket, io: Server) {
  const index = waitingPlayers.findIndex(p => p.id === socket.id);
  if (index !== -1) {
    waitingPlayers.splice(index, 1);
  }

  const roomName = findPlayerRoom(socket.id);
  if (roomName) {
    const opponentId = getOpponentId(roomName, socket.id);
    if (opponentId) {
      io.to(opponentId).emit('gameEnd');
      delete players[opponentId];
    }
    cleanupGameData(roomName);
  }

  delete players[socket.id];
}
