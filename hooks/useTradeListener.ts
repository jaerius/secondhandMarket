// hooks/useTradeAcceptedListener.ts

import { ethers, Contract, EventLog } from 'ethers';
import { useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import {
  showTradeAcceptedModalState,
  acceptedTradeInfoState,
} from '../atom/trade';
import { accountState } from '../atom/account';

const POLLING_INTERVAL = 30000; // 30 seconds

const useTradeAcceptedListener = (
  contractAddress: string,
  abi: ethers.InterfaceAbi,
) => {
  const setShowTradeAcceptedModal = useSetRecoilState(
    showTradeAcceptedModalState,
  );
  const setAcceptedTradeInfo = useSetRecoilState(acceptedTradeInfoState);
  const acceptedTradeInfo = useRecoilValue(acceptedTradeInfoState);
  const account = useRecoilValue(accountState);

  const queryPastEvents = useCallback(async () => {
    //if (!account) return;

    console.log('Querying past TradeAccepted events');
    const provider = new ethers.JsonRpcProvider(process.env.SCROLL_TESTNET_URL);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = currentBlock - 100; // Check last 100 blocks for simplicity

      console.log(
        `Querying TradeAccepted events from block ${fromBlock} to ${currentBlock}`,
      );
      const filter = contract.filters.TradeAccepted();
      const events = await contract.queryFilter(
        filter,
        fromBlock,
        currentBlock,
      );

      console.log(`Found ${events.length} new TradeAccepted events`);

      if (events.length > 0) {
        console.log(
          'event legnth is longer than 0 Latest event:',
          events[events.length - 1],
        );
        // Process only the latest event
        const latestEvent = events[events.length - 1];
        if (latestEvent instanceof EventLog) {
          const { tradeId } = latestEvent.args;

          if (!acceptedTradeInfo) return;
          if (
            tradeId === acceptedTradeInfo.tradeId &&
            acceptedTradeInfo.buyer.toLowerCase() === account.toLowerCase()
          ) {
            console.log('Trade accepted, showing modal for buyer');
            setShowTradeAcceptedModal(true);
          } else {
            console.log(
              'Trade accepted, but does not match stored info or current account is not the buyer',
            );
          }
        } else {
          console.log(
            'Trade accepted, but current account is not the buyer. Not showing modal.',
          );
        }
      }
    } catch (error) {
      console.error('Error querying past TradeAccepted events:', error);
    }
  }, [
    account,
    contractAddress,
    abi,
    setShowTradeAcceptedModal,
    setAcceptedTradeInfo,
  ]);

  useEffect(() => {
    if (account && acceptedTradeInfo) {
      // Initial query
      queryPastEvents();

      // Set up periodic polling
      const intervalId = setInterval(queryPastEvents, POLLING_INTERVAL);

      // Clean up on unmount
      return () => clearInterval(intervalId);
    }
  }, [account, acceptedTradeInfo, queryPastEvents]);
};

export default useTradeAcceptedListener;
