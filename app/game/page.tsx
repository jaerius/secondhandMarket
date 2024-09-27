'use client';

import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { getContract } from '../../lib/ethereum';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

interface GameProps {
  owner: string;
  price: string;
  offer: number;
  proof: string;
}

type GameState =
  | 'idle'
  | 'offerMade'
  | 'offerAccepted'
  | 'gameStarted'
  | 'gameEnded';

interface Clicks {
  buyer: number;
  seller: number;
}

const Game: React.FC<GameProps> = ({ owner, price, offer, proof }) => {
  const [tradeId, setTradeId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [clicks, setClicks] = useState<Clicks>({ buyer: 0, seller: 0 });
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      const contractInstance = await getContract();
      setContract(contractInstance);
    };
    initContract();

    socket.on('updateClicks', ({ player }: { player: keyof Clicks }) => {
      setClicks((prev) => ({ ...prev, [player]: prev[player] + 1 }));
    });

    return () => {
      socket.off('updateClicks');
    };
  }, []);

  const handleMakeOffer = async (
    owner: string,
    price: string,
    offer: number,
    proof: string,
  ) => {
    if (!contract) return;
    try {
      const tx = await contract.makeOffer(
        owner,
        price, // sellerPrice
        ethers.parseEther('0.5'), // buyerOffer
        [0n, 0n, 0n, 0n], // zkProof
      );

      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      if (receipt) {
        const offerMadeEvent = contract.interface.getEvent('OfferMade');
        const offerMadeLogs = receipt.logs.filter(
          (log: { topics: any[] }) =>
            log.topics[0] === contract.interface.getEvent('OfferMade'),
        );

        if (offerMadeLogs.length > 0) {
          const parsedLog = contract.interface.parseLog({
            topics: offerMadeLogs[0].topics,
            data: offerMadeLogs[0].data,
          });

          if (parsedLog) {
            const newTradeId = parsedLog.args.tradeId;
            console.log('Trade ID:', newTradeId);
            setTradeId(newTradeId);
            setGameState('offerMade');
          }
        } else {
          console.error('OfferMade event not found in transaction logs');
        }
      }
    } catch (error) {
      console.error('Error making offer:', error);
    }
  };

  const handleAcceptOffer = async () => {
    if (!contract || !tradeId) return;
    try {
      const tx = await contract.acceptOffer(tradeId);
      await tx.wait();
      setGameState('offerAccepted');
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleStartGame = async () => {
    if (!contract || !tradeId) return;
    try {
      const tx = await contract.startGame(tradeId);
      await tx.wait();
      setGameState('gameStarted');
      socket.emit('joinGame', tradeId);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleClick = (player: keyof Clicks) => {
    if (gameState === 'gameStarted' && tradeId) {
      socket.emit('click', { tradeId, player });
    }
  };

  const handleEndGame = async () => {
    if (!contract || !tradeId) return;
    try {
      const tx = await contract.endGame(tradeId, clicks.buyer, clicks.seller);
      await tx.wait();
      setGameState('gameEnded');
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  return (
    <div>
      {gameState === 'offerMade' && (
        <button onClick={handleAcceptOffer}>Accept Offer</button>
      )}
      {gameState === 'offerAccepted' && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {gameState === 'gameStarted' && (
        <>
          <button onClick={() => handleClick('buyer')}>Buyer Click</button>
          <button onClick={() => handleClick('seller')}>Seller Click</button>
          <div>Buyer Clicks: {clicks.buyer}</div>
          <div>Seller Clicks: {clicks.seller}</div>
        </>
      )}
      {gameState === 'gameStarted' && (
        <button onClick={handleEndGame}>End Game</button>
      )}
      {gameState === 'gameEnded' && <div>Game Ended!</div>}
    </div>
  );
};

export default Game;
