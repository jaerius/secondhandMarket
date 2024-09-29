// components/TradeAcceptedModal.tsx
'use client';
import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  showTradeAcceptedModalState,
  acceptedTradeInfoState,
} from '../../atom/trade';
import { useRouter } from 'next/navigation';
import { set } from 'react-hook-form';

const TradeAcceptedModal: React.FC = () => {
  const [showModal, setShowModal] = useRecoilState(showTradeAcceptedModalState);
  const acceptedTradeInfo = useRecoilValue(acceptedTradeInfoState);
  const router = useRouter();

  useEffect(() => {
    console.log('TradeAcceptedModal: showModal changed', showModal);
  }, [showModal]);

  console.log('TradeAcceptedModal rendering', { showModal, acceptedTradeInfo });

  if (!showModal || !acceptedTradeInfo) return null;

  const handleGoToRoom = () => {
    // Implement navigation to the trade room here
    console.log(
      `Navigating to room for trade ID: ${acceptedTradeInfo.tradeId}`,
    );
    setShowModal(false);
    const url = `/game?tradeId=${acceptedTradeInfo.tradeId}&role=buyer&price=${acceptedTradeInfo.offerPrice}`;

    router.push(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          Your Trade Offer was Accepted!
        </h2>
        <p className="mb-4">
          Your trade (ID: {acceptedTradeInfo.tradeId}) has been accepted by the
          seller. Would you like to go to the trade room?
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleGoToRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Room
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeAcceptedModal;
