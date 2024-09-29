'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSocket from '../../hooks/useSocket';
import { useRecoilValue } from 'recoil';
import { ChartConfig } from '@/components/ui/chart';
import { acceptedTradeInfoState } from '../../atom/trade';
import { accountState } from '@/atom/account';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { endGame, startGame } from '@/lib/ethereum';

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sellerTapCount, setSellerTapCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStartedYet, setGameStartedYet] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태 추가
  const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null);
  const account = useRecoilValue(accountState);
  const [gameOver, setGameOver] = useState(false); // 게임 종료 상태 추가

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
      endGame(currentTradeId, sellerTapCount / 2, tapCount);
      onOpen(); // 게임 끝나면 모달 열기
      setGameOver(true);
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
      setCountdownActive(false);
      startGame(currentTradeId);
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
  const currentTradeId : string = tradeInfo?.tradeId!
  console.log("currentTradeId", currentTradeId)
  
  const handleJoinRoom = () => {
    if (socket && currentTradeId) {
      socket.emit('joinRoom', { currentTradeId, role });
      // 카운트다운 및 게임 시작 로직
      socket.on('gameStart', () => {
        startCountdown();
        setGameStartedYet(false);
        setTapCount(0);
        setSellerTapCount(0);
      });
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className='min-h-screen bg-green-500 font-mono flex flex-col items-center justify-center relative'>
      {gameOver && (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeButton={false}
        className="flex items-center justify-center"
      >
        <ModalContent className="bg-white font-mono mx-auto">
          <ModalHeader className="text-center">Game Result</ModalHeader>
          <ModalBody>
            <div>
              <p>My tab count: {tapCount}</p>
              <p>Opponent tab count: {sellerTapCount / 2}</p>
              <p>Final price: {((Number(tradeInfo?.offerPrice) + Number(tradeInfo?.sellerPrice)) * (tapCount / (sellerTapCount / 2 + tapCount))).toFixed(2)}</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )}
      
      <h1 className='text-2xl mb-4'>
        {gameStartedYet ? 'Ready to play game...' : 
         countdownActive ? countdown : 
         gameOver ? 'Game Over' : 
         "Let's Start!!"}
      </h1>
      {gameStartedYet ? (
        <div className='flex flex-col items-center'>
        </div>
      ) : gameStarted ? (
        <div className='flex flex-col items-center'>
          <Button onClick={handleTap} className='mb-2'>Tab!!</Button>
          <p>my tab count: {tapCount}</p>
          <p>opponent tab count: {sellerTapCount / 2}</p>
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
          <p>my tab count: {tapCount}</p>
          <p>opponent tab count: {sellerTapCount / 2}</p>
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
