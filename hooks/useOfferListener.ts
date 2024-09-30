'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import {
  offerCountState,
  latestOfferState,
  showModalState,
  Offer,
  processedOfferCountState,
} from '../atom/offer';
import { Config, watchContractEvent, getPublicClient } from '@wagmi/core';
import { parseEther, Log, Abi, AbiEvent, decodeEventLog } from 'viem';

const POLLING_INTERVAL = 30000; // 30 seconds

type OfferMadeEvent = {
  args: {
    tradeId: bigint;
    buyer: string;
    seller: string;
    sellerPrice: bigint;
    buyerOffer: bigint;
  };
};

const useOfferListener = (
  account: string,
  contractAddress: `0x${string}`,
  abi: any,
  config: Config,
) => {
  const setOfferCount = useSetRecoilState(offerCountState);
  const setLatestOffer = useSetRecoilState(latestOfferState);
  const setShowModal = useSetRecoilState(showModalState);
  const currentOfferCount = useRecoilValue(offerCountState);
  const processedOfferCount = useRecoilValue(processedOfferCountState);

  const lastCheckedBlockRef = useRef<bigint>(BigInt(0));

  const handleOfferMadeEvent = useCallback(
    (event: OfferMadeEvent) => {
      const { tradeId, buyer, seller, sellerPrice, buyerOffer } = event.args;

      setOfferCount((prevCount) => prevCount + 1);

      const newOffer: Offer = {
        tradeId: tradeId.toString(),
        buyer,
        seller,
        sellerPrice: parseEther(sellerPrice.toString()).toString(),
        buyerOffer: parseEther(buyerOffer.toString()).toString(),
      };

      setLatestOffer(newOffer);

      if (currentOfferCount + 1 > processedOfferCount) {
        setShowModal(true);
      }
    },
    [
      setOfferCount,
      setLatestOffer,
      setShowModal,
      currentOfferCount,
      processedOfferCount,
    ],
  );

  const getOfferMadeEvent = useCallback((abi: Abi): AbiEvent | undefined => {
    return abi.find(
      (item): item is AbiEvent =>
        item.type === 'event' && item.name === 'OfferMade',
    );
  }, []);

  useEffect(() => {
    const unwatch = watchContractEvent(
      config,
      {
        address: contractAddress,
        abi,
        eventName: 'OfferMade',
      },
      (logs: Log[]) => {
        // logs의 타입을 명시적으로 정의
        logs.forEach((log) => {
          const event = log as unknown as OfferMadeEvent;
          handleOfferMadeEvent(event);
        });
      },
    );

    return () => {
      unwatch();
    };
  }, [config, contractAddress, abi, handleOfferMadeEvent]);

  const queryPastEvents = useCallback(async () => {
    const publicClient = getPublicClient(config);
    if (!publicClient) return;

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = lastCheckedBlockRef.current;

      console.log(`Querying events from block ${fromBlock} to ${currentBlock}`);

      const offerMadeEvent = getOfferMadeEvent(abi);

      if (!offerMadeEvent) {
        console.error('OfferMade event not found in ABI');
        return;
      }

      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: offerMadeEvent,
        fromBlock,
        toBlock: currentBlock,
      });

      console.log(`Found ${logs.length} new OfferMade events`);

      logs.forEach((log) => {
        const decodedLog = decodeEventLog({
          abi: [offerMadeEvent],
          data: log.data,
          topics: log.topics,
        });
        handleOfferMadeEvent({
          args: decodedLog.args as OfferMadeEvent['args'],
        });
      });

      lastCheckedBlockRef.current = currentBlock + BigInt(1);
    } catch (error) {
      console.error('Error querying past events:', error);
    }
  }, [contractAddress, abi, config, handleOfferMadeEvent, getOfferMadeEvent]);

  useEffect(() => {
    if (account) {
      queryPastEvents();
      const intervalId = setInterval(queryPastEvents, POLLING_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [account, queryPastEvents]);

  return currentOfferCount;
};

export default useOfferListener;
//   const queryPastEvents = useCallback(async () => {
//     console.log('Querying past events');
//     const provider = new ethers.JsonRpcProvider(process.env.SCROLL_TESTNET_URL);
//     const contract = new ethers.Contract(contractAddress, abi, provider);

//     try {
//       const currentBlock = await provider.getBlockNumber();
//       const fromBlock = lastCheckedBlockRef.current;

//       console.log(`Querying events from block ${fromBlock} to ${currentBlock}`);
//       const filter = contract.filters.OfferMade();
//       const events = await contract.queryFilter(
//         filter,
//         fromBlock,
//         currentBlock,
//       );

//       console.log(`Found ${events.length} new OfferMade events`);
//       console.log(`Event args:`, events[0]);

//       if (events.length > 0) {
//         const newOfferCount = currentOfferCount + events.length;
//         setOfferCount(newOfferCount);

//         // Process only the latest event
//         const latestEvent = events[events.length - 1];
//         if (latestEvent instanceof EventLog) {
//           const { tradeId, buyer, seller, sellerPrice, buyerOffer } =
//             latestEvent.args;
//           const newOffer: Offer = {
//             tradeId: tradeId.toString(),
//             buyer,
//             seller,
//             sellerPrice: ethers.formatEther(sellerPrice),
//             buyerOffer: ethers.formatEther(buyerOffer),
//           };
//           setLatestOffer(newOffer);
//           console.log('Setting modal to show', showModalState);
//           if (newOfferCount > processedOfferCount) {
//             console.log('Setting modal to show', true);
//             setShowModal(true);
//           }
//           console.log('Modal should be showing', showModalState);
//         }
//       }

//       // Update the last checked block
//       lastCheckedBlockRef.current = currentBlock + 1;
//     } catch (error) {
//       console.error('Error querying past events:', error);
//     }
//   }, [contractAddress, abi, setOfferCount, setLatestOffer, setShowModal]);

//   useEffect(() => {
//     if (account) {
//       // Initial query
//       queryPastEvents();

//       // Set up periodic polling
//       const intervalId = setInterval(queryPastEvents, POLLING_INTERVAL);

//       // Clean up on unmount
//       return () => clearInterval(intervalId);
//     }
//   }, [account, queryPastEvents]);

//   return currentOfferCount;
// };

// export default useOfferListener;
