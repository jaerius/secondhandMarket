'use client';

import { useRecoilValue } from 'recoil';
import { accountState } from '@/atom/account';
import useOfferListener from '@/hooks/useOfferListener';
import zkContract from '../artifacts/contracts/ZKGameTradingContract.sol/ZKGameTradingContract.json';
import useTradeAcceptedListener from '@/hooks/useTradeListener';

const contractAddress = '0xD410658f238f11CA47657cAa00F2e85F3d9Ff00d';
const abi = zkContract.abi;

export default function OfferListenerWrapper() {
  const account = useRecoilValue(accountState);
  useOfferListener(account, contractAddress, abi);
  useTradeAcceptedListener(contractAddress, abi);
  return null;
}
