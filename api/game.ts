import { Server, Socket } from 'socket.io';

const io = new Server(3001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
  console.log('New client connected');

  socket.on('joinGame', (tradeId: string) => {
    socket.join(tradeId);
  });

  socket.on(
    'click',
    ({ tradeId, player }: { tradeId: string; player: string }) => {
      io.to(tradeId).emit('updateClicks', { player });
    },
  );

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

console.log('SocketIO server running on port 3001');
