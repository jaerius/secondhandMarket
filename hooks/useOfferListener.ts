'use client';
import { ethers, Contract, EventLog } from 'ethers';
import { useEffect, useCallback, useRef } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import {
  offerCountState,
  latestOfferState,
  showModalState,
  Offer,
} from '../atom/offer';

const POLLING_INTERVAL = 30000; // 30 seconds

const useOfferListener = (
  account: string,
  contractAddress: string,
  abi: ethers.InterfaceAbi,
) => {
  const setOfferCount = useSetRecoilState(offerCountState);
  const setLatestOffer = useSetRecoilState(latestOfferState);
  const setShowModal = useSetRecoilState(showModalState);
  const currentOfferCount = useRecoilValue(offerCountState);

  const lastCheckedBlockRef = useRef<number>(0);

  const queryPastEvents = useCallback(async () => {
    console.log('Querying past events');
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
    );
    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = lastCheckedBlockRef.current;

      console.log(`Querying events from block ${fromBlock} to ${currentBlock}`);
      const filter = contract.filters.OfferMade();
      const events = await contract.queryFilter(
        filter,
        fromBlock,
        currentBlock,
      );

      console.log(`Found ${events.length} new OfferMade events`);
      console.log(`Event args:`, events[0]);

      if (events.length > 0) {
        setOfferCount((prevCount: number) => prevCount + events.length);

        // Process only the latest event
        const latestEvent = events[events.length - 1];
        if (latestEvent instanceof EventLog) {
          const { tradeId, buyer, seller, sellerPrice, buyerOffer } =
            latestEvent.args;
          const newOffer: Offer = {
            tradeId: tradeId.toString(),
            buyer,
            seller,
            sellerPrice: ethers.formatEther(sellerPrice),
            buyerOffer: ethers.formatEther(buyerOffer),
          };
          setLatestOffer(newOffer);
          console.log('Setting modal to show', showModalState);
          setShowModal(true);
          console.log('Modal should be showing', showModalState);
        }
      }

      // Update the last checked block
      lastCheckedBlockRef.current = currentBlock + 1;
    } catch (error) {
      console.error('Error querying past events:', error);
    }
  }, [contractAddress, abi, setOfferCount, setLatestOffer, setShowModal]);

  useEffect(() => {
    if (account) {
      // Initial query
      queryPastEvents();

      // Set up periodic polling
      const intervalId = setInterval(queryPastEvents, POLLING_INTERVAL);

      // Clean up on unmount
      return () => clearInterval(intervalId);
    }
  }, [account, queryPastEvents]);

  return currentOfferCount;
};

export default useOfferListener;
