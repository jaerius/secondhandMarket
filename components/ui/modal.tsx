'use client';

import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  latestOfferState,
  showModalState,
  offerCountState,
} from '../../atom/offer';
import { acceptOffer } from '@/lib/ethereum';

const OfferModal: React.FC = () => {
  const [showModal, setShowModal] = useRecoilState(showModalState);
  const latestOffer = useRecoilValue(latestOfferState);
  const offerCount = useRecoilValue(offerCountState);

  console.log('OfferModal', latestOffer);

  useEffect(() => {
    if (offerCount > 0 && latestOffer) {
      setShowModal(true);
      console.log('Setting show modal to true');
    }
  }, [offerCount, latestOffer, setShowModal]);

  if (!showModal || !latestOffer) return null;

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded shadow-lg z-50">
      <h2 className="text-lg font-bold mb-2">New Offer Received</h2>
      <p>Trade ID: {latestOffer.tradeId}</p>
      <p>Buyer: {latestOffer.buyer}</p>
      <p>Seller Price: {latestOffer.sellerPrice} ETH</p>
      <p>Buyer Offer: {latestOffer.buyerOffer} ETH</p>
      <div className="mt-4 flex justify-end">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => {
            acceptOffer(latestOffer.tradeId);
            setShowModal(false);
          }}
        >
          Accept
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(false)}
        >
          Deny
        </button>
      </div>
    </div>
  );
};

export default OfferModal;
