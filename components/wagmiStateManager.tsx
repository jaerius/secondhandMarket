'use client';
import { useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useRecoilState } from 'recoil';
import { accountState } from '../atom/account';
import { balanceState } from '../atom/balance';
import { scrollSepolia } from 'viem/chains';

export const WagmiStateManager: React.FC = () => {
  const [account, setAccount] = useRecoilState(accountState);
  const [balance, setBalance] = useRecoilState(balanceState);

  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address,
    chainId: scrollSepolia.id,
  });
  console.log('address', address);
  console.log('balance', balanceData);

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
    } else {
      setAccount('');
    }
  }, [isConnected, address, setAccount]);

  useEffect(() => {
    if (balanceData) {
      setBalance(balanceData.formatted);
    } else {
      setBalance('0');
    }
  }, [balanceData, setBalance]);

  return null;
};
