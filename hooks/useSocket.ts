// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 서버와 연결
    const newSocket = io();

    setSocket(newSocket);

    return () => {
      // 컴포넌트 언마운트 시 소켓 연결 해제
      newSocket.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;