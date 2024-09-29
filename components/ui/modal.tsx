'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  latestOfferState,
  showModalState,
  offerCountState,
} from '../../atom/offer';
import { acceptOffer } from '@/lib/ethereum';
import useOfferListener from '@/hooks/useOfferListener';

const OfferModal: React.FC = () => {
  const [showModal, setShowModal] = useRecoilState(showModalState);
  const latestOffer = useRecoilValue(latestOfferState);
  const offerCount = useRecoilValue(offerCountState);
  const setOfferCount = useSetRecoilState(offerCountState);
  const [processedOfferCount, setProcessedOfferCount] = useState(0);

  console.log('OfferModal', {
    latestOffer,
    showModal,
    offerCount,
    processedOfferCount,
  });

  const handleDeny = useCallback(() => {
    setShowModal(false);
    setProcessedOfferCount(offerCount);
    console.log('Denying offer, closing modal');
  }, [setShowModal, offerCount]);

  const handleAccept = useCallback(() => {
    if (!latestOffer) return;
    acceptOffer(latestOffer.tradeId);
    setShowModal(false);
    setProcessedOfferCount(offerCount);
    console.log('Accepting offer, closing modal');
  }, [latestOffer, setShowModal, offerCount]);

  useEffect(() => {
    if (offerCount > processedOfferCount && latestOffer && !showModal) {
      setShowModal(true);
      console.log('New offer received, opening modal');
    }
  }, [offerCount, processedOfferCount, latestOffer, showModal, setShowModal]);

  if (!showModal || !latestOffer) {
    console.log('Modal not showing', { showModal, latestOffer });
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded shadow-lg z-50">
      <h2 className="text-lg font-bold mb-2">New Offer Received</h2>
      <p>Trade ID: {latestOffer.tradeId}</p>
      <p>Buyer: {latestOffer.buyer}</p>
      <p>Seller Price: {latestOffer.sellerPrice} ETH</p>
      <p>Buyer Offer: {latestOffer.buyerOffer} ETH</p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAccept}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Accept
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleDeny}
        >
          Deny
        </button>
      </div>
    </div>
  );
};

export default OfferModal;
