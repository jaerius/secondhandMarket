'use client';

import { useRecoilValue } from 'recoil';
import { accountState } from '@/atom/account';
import useOfferListener from '@/hooks/useOfferListener';
import zkContract from '../artifacts/contracts/ZKGameTradingContract.sol/ZKGameTradingContract.json';
import useTradeAcceptedListener from '@/hooks/useTradeListener';

const contractAddress = '0x33d371747C6f5509467803a9fC41f209b80510b8';
const abi = zkContract.abi;

export default function OfferListenerWrapper() {
  const account = useRecoilValue(accountState);
  useOfferListener(account, contractAddress, abi);
  useTradeAcceptedListener(contractAddress, abi);
  return null;
}
