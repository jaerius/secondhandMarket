// server.ts

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev }); // Next.js 앱 생성
const handle = nextApp.getRequestHandler(); // Next.js의 기본 요청 핸들러

const PORT = /*process.env.PORT || */ 3001;

// 플레이어와 게임 방 관리를 위한 데이터 구조
interface PlayerData {
  roomName: string;
  tapCount: number;
}

const waitingPlayers: string[] = []; // 매칭을 기다리는 플레이어들의 소켓 ID 리스트
const rooms: { [roomName: string]: string[] } = {}; // 각 게임 방의 플레이어 소켓 ID 리스트
const players: { [socketId: string]: PlayerData } = {}; // 각 플레이어의 데이터

nextApp.prepare().then(() => {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

  // Socket.IO 이벤트 처리
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // 플레이어를 대기열에 추가하고 매치메이킹 시도
    waitingPlayers.push(socket.id);
    attemptMatchmaking(socket, io);

    // 탭 이벤트 처리
    socket.on('tap', () => {
      const roomName = findPlayerRoom(socket.id);
      if (roomName) {
        // 서버에서 플레이어의 탭 횟수를 증가시키고 상대방에게 전달
        incrementTapCount(socket.id);
        const opponentId = getOpponentId(roomName, socket.id);
        const playerTapCount = getPlayerTapCount(socket.id);
        io.to(opponentId).emit('opponentTap', playerTapCount);
      }
    });

    // 연결 해제 처리
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      handleDisconnect(socket, io);
    });
  });

  // 모든 요청을 Next.js로 처리
  app.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  // 서버 시작
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

function attemptMatchmaking(socket: Socket, io: Server) {
  if (waitingPlayers.length >= 2) {
    const player1Id = waitingPlayers.shift()!;
    const player2Id = waitingPlayers.shift()!;

    const roomName = `room-${player1Id}-${player2Id}`;
    rooms[roomName] = [player1Id, player2Id];

    // 플레이어들을 방에 추가
    const player1Socket = io.sockets.sockets.get(player1Id);
    const player2Socket = io.sockets.sockets.get(player2Id);

    if (player1Socket && player2Socket) {
      player1Socket.join(roomName);
      player2Socket.join(roomName);

      // 각 플레이어의 데이터를 초기화
      initializePlayerData(player1Id, roomName);
      initializePlayerData(player2Id, roomName);

      // 게임 시작 이벤트를 방에 있는 플레이어들에게 보냄
      io.to(roomName).emit('gameStart');

      // 게임 타이머 시작
      startGameTimer(roomName, io);
    } else {
      // 소켓이 존재하지 않는 경우 (예외 처리)
      console.error('Player socket not found during matchmaking.');
    }
  }
}

function initializePlayerData(playerId: string, roomName: string) {
  players[playerId] = {
    roomName: roomName,
    tapCount: 0,
  };
}

function incrementTapCount(playerId: string) {
  if (players[playerId]) {
    players[playerId].tapCount++;
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

function startGameTimer(roomName: string, io: Server) {
  const GAME_TIME = 13000; // 게임 시간 (10초) + 대기시간 3초

  setTimeout(() => {
    // 게임 종료 이벤트를 방에 있는 플레이어들에게 보냄
    io.to(roomName).emit('gameEnd');

    // 결과 계산 및 전송
    const playerIds = rooms[roomName];
    const results = playerIds.map((id) => ({
      playerId: id,
      tapCount: players[id]?.tapCount || 0,
    }));

    io.to(roomName).emit('gameResult', results);

    // 게임 데이터 정리
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
  // 대기열에서 플레이어 제거
  const index = waitingPlayers.indexOf(socket.id);
  if (index !== -1) {
    waitingPlayers.splice(index, 1);
  }

  // 게임 중인 경우 방에서 제거하고 상대방에게 알림
  const roomName = findPlayerRoom(socket.id);
  if (roomName) {
    const opponentId = getOpponentId(roomName, socket.id);
    if (opponentId) {
      io.to(opponentId).emit('gameEnd');
      // 상대방의 게임 데이터를 정리
      delete players[opponentId];
    }
    // 게임 데이터 정리
    cleanupGameData(roomName);
  }

  // 플레이어 데이터 삭제
  delete players[socket.id];
}
