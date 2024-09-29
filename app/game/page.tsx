'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSocket from '../../hooks/useSocket';
import { useRecoilValue } from 'recoil';
import { ChartConfig } from '@/components/ui/chart';
import { acceptedTradeInfoState } from '../../atom/trade';
import { accountState } from '@/atom/account';
import { Button } from "@nextui-org/react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { endGame } from '@/lib/ethereum';

interface TradeInfo {
  tradeId: string;
  buyer: string;
  seller: string;
  offerPrice: string;
  sellerPrice: string;
}

const GamePage = () => {
  const socket = useSocket();
  const [tapCount, setTapCount] = useState(0);
  const [sellerTapCount, setSellerTapCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStartedYet, setGameStartedYet] = useState(true);
  const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null);
  const account = useRecoilValue(accountState);

  const searchParams = useSearchParams();
  const tradeId = searchParams.get('tradeId');

  const acceptedTradeInfo = useRecoilValue(acceptedTradeInfoState);

  useEffect(() => {
    if (tradeId) {
      const storedTradeInfo = localStorage.getItem('acceptedTradeInfo');
      if (storedTradeInfo) {
        const parsedTradeInfo: TradeInfo[] = JSON.parse(storedTradeInfo);
        const currentTradeInfo = parsedTradeInfo.find(
          (trade) => trade.tradeId === tradeId,
        );
        if (currentTradeInfo) {
          setTradeInfo(currentTradeInfo);
        }
      }
    }
  }, [tradeId]);

  
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [countdown, setCountdown] = useState(3); // 카운트다운 상태 추가
  const [countdownActive, setCountdownActive] = useState(false); // 카운트다운 활성화 상태 추가

  const chartConfig: ChartConfig = {
    up: {
      label: 'principal',
      color: '#00A29A'
    },
    down: {
      label: 'opponent',
      color: '#C73535'
    }
  };

  const chartData = [
    {
      name: 'price',
      principal: tapCount,
      opponent: sellerTapCount / 2
    }
  ];

  useEffect(() => {
    if (!socket) {
      console.log('socket not connected');
      return;
    }

    const handleConnect = () => {
      console.log(`Connected: ${socket.id}`);
    };

    const handleGameStart = () => {
      setGameStartedYet(false);
      setTapCount(0);
      setSellerTapCount(0);
      startCountdown(); // 게임 시작 시 카운트다운 시작
    };

    const handleOpponentTap = (count: number) => {
      setSellerTapCount(count);
    };

    const handleGameEnd = () => {
      setGameStarted(false);
      endGame(roomId, sellerTapCount / 2, tapCount);
    };

    socket.on('connect', handleConnect);
    socket.on('gameStart', handleGameStart);
    socket.on('opponentTap', handleOpponentTap);
    socket.on('gameEnd', handleGameEnd);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('gameStart', handleGameStart);
      socket.off('opponentTap', handleOpponentTap);
      socket.off('gameEnd', handleGameEnd);
    };
  }, [socket]);

  useEffect(() => {
    if (countdownActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setGameStarted(true); // 카운트다운이 끝나면 게임 시작
    }
  }, [countdown, countdownActive]);

  const startCountdown = () => {
    setCountdown(3); // 카운트다운 초기화
    setCountdownActive(true); // 카운트다운 활성화
  };

  const handleTap = () => {
    if (!gameStarted || !socket) return;
    setTapCount((prevCount) => {
      const newCount = prevCount + 1;
      socket.emit('tap', { count: newCount, role });
      return newCount;
    });
  };

  const handleJoinRoom = () => {
    if (socket && roomId) {
      socket.emit('joinRoom', { roomId, role });
      // 카운트다운 및 게임 시작 로직
      socket.on('gameStart', () => {
        startCountdown();
      });
    }
  };

  return (
    <div className='min-h-screen bg-green-500 font-mono flex flex-col items-center justify-center'>
      <h1 className='text-2xl mb-4'>
        {countdownActive ? countdown : '가격 흥정 시작!'}
      </h1>
      {gameStartedYet ? (
        <div className='flex flex-col items-center'>
          <input
            type="text"
            placeholder="방 ID 입력"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className='mb-2 p-2'
          />
          <select value={role} onChange={(e) => setRole(e.target.value as 'buyer' | 'seller')} className='mb-2 p-2'>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
          <Button onClick={handleJoinRoom} className='mb-2'>방에 참여하기</Button>
          <p>게임 대기 중...</p>
        </div>
      ) : gameStarted ? (
        <div className='flex flex-col items-center'>
          <Button onClick={handleTap} className='mb-2'>탭!</Button>
          <p>내 탭 횟수: {tapCount}</p>
          <p>상대방 탭 횟수: {sellerTapCount / 2}</p>
          <p>{((tapCount / (sellerTapCount / 2 + tapCount)) * 100).toFixed(2)} %</p>
          <p>{(2000 * (tapCount / (sellerTapCount / 2 + tapCount))).toFixed(2)}</p>
          <ResponsiveContainer width="100%" height={36}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip cursor={false} />
              <Bar
                dataKey="principal"
                stackId="a"
                fill={chartConfig.up.color}
                barSize={20}
                radius={[10, 0, 0, 10]}
              />
              <Bar
                dataKey="opponent"
                stackId="a"
                fill={chartConfig.down.color}
                barSize={20}
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className='flex flex-col items-center'>
          <p>내 탭 횟수: {tapCount}</p>
          <p>상대방 탭 횟수: {sellerTapCount / 2}</p>
          <p>{((tapCount / (sellerTapCount / 2 + tapCount)) * 100).toFixed(2)} %</p>
          <p>{(2000 * (tapCount / (sellerTapCount / 2 + tapCount))).toFixed(2)}</p>
          <ResponsiveContainer width="100%" height={36}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip cursor={false} />
              <Bar
                dataKey="principal"
                stackId="a"
                fill={chartConfig.up.color}
                barSize={30}
                radius={[10, 0, 0, 10]}
              />
              <Bar
                dataKey="opponent"
                stackId="a"
                fill={chartConfig.down.color}
                barSize={30}
                radius={[0, 10, 10, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GamePage;
