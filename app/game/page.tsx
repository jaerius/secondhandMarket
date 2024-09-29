'use client';
import { useEffect, useState } from 'react';
import useSocket from '../../hooks/useSocket';

const GamePage = () => {
  const socket = useSocket();
  const [tapCount, setTapCount] = useState(0);
  const [opponentTapCount, setOpponentTapCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStartedYet, setGameStartedYet] = useState(true);

  useEffect(() => {
    if (!socket) {
      console.log('socket not connected');
      return;
    }

    const handleConnect = () => {
      console.log(`Connected: ${socket.id}`);
    };

    const handleGameStart = () => {
      setGameStarted(true);
      setGameStartedYet(false);
      setTapCount(0);
      setOpponentTapCount(0);
    };

    const handleOpponentTap = (count: number) => {
      setOpponentTapCount(count);
    };

    const handleGameEnd = () => {
      setGameStarted(false);
    };

    socket.on('connect', handleConnect);
    socket.on('gameStart', handleGameStart);
    socket.on('opponentTap', handleOpponentTap);
    socket.on('gameEnd', handleGameEnd);

    return () => {
      // Cleanup these event listeners when the component unmounts
      socket.off('connect', handleConnect);
      socket.off('gameStart', handleGameStart);
      socket.off('opponentTap', handleOpponentTap);
      socket.off('gameEnd', handleGameEnd);
    };
  }, [socket]); // 소켓의 연결 상태가 변경될 때마다 이 useEffect를 재실행합니다.

  const handleTap = () => {
    if (!gameStarted || !socket) return;
    setTapCount((prevCount) => {
      const newCount = prevCount + 1;
      socket.emit('tap', newCount);
      return newCount;
    });
  };

  return (
    <div className='min-h-screen bg-green-500 font-mono'>
      <h1>실시간 탭 게임</h1>
      {gameStartedYet ? (
        <p>게임 대기 중...</p>
      ) : gameStarted ? (
        <div>
          <button onClick={handleTap}>탭!</button>
          <p>내 탭 횟수: {tapCount}</p>
          <p>상대방 탭 횟수: {opponentTapCount / 2}</p>
          <p>{((tapCount / (opponentTapCount / 2 + tapCount)) * 100).toFixed(2)} %</p>
          <p>{(2000 * (tapCount / (opponentTapCount / 2 + tapCount))).toFixed(2)}</p>
        </div>
      ) : (
        <div>
          <p>내 탭 횟수: {tapCount}</p>
          <p>상대방 탭 횟수: {opponentTapCount / 2}</p>
          <p>{((tapCount / (opponentTapCount / 2 + tapCount)) * 100).toFixed(2)} %</p>
          <p>{(2000 * (tapCount / (opponentTapCount / 2 + tapCount))).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
