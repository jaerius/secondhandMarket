'use client';

import { CHAIN_NAMESPACES, IProvider, UserInfo } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'; // 이더리움용 PrivateKeyProvider로 변경
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useRecoilState } from 'recoil';
import { accountState } from '@/atom/account';
import { balanceState } from '@/atom/balance';
import { ellipsisAddress } from '@/utils/strings';
import { ethers } from 'ethers';

export const Wallet: React.FC = () => {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [account, setAccount] = useRecoilState(accountState);
  const [balance, setBalance] = useRecoilState(balanceState);
  const clientId =
    'BGUM9pLACidLnpI8zYVxTONoaKHV59U8-5Cw9vjdLaIn9r6RU0TLCItXpLsDjVQPAcfcWKlWVm9CDU5mBlElX0M';

  // 이더리움 네트워크 관련 설정
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155, // EVM 기반 네트워크
    chainId: '0xaa36a7', // Ethereum 메인넷 체인 ID (0x1 = 메인넷, 0x5 = Goerli 테스트넷)
    rpcTarget:
      'https://eth-sepolia.g.alchemy.com/v2/CAg7OLEoHDdLQXA_P8tWRCQ_SND4RYt8', // Infura 또는 Alchemy 등의 RPC 제공자
    wsTarget:
      'hhttps://eth-sepolia.g.alchemy.com/v2/CAg7OLEoHDdLQXA_P8tWRCQ_SND4RYt8', // 웹소켓 RPC (선택 사항)
    ticker: 'ETH',
    tickerName: 'Sepolia',
    displayName: 'Ethereum Mainnet',
    blockExplorerUrl: 'https://etherscan.io', // 이더리움 블록 익스플로러
    clientId: '',
  };

  // 이더리움 전용 PrivateKeyProvider
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const web3auth = new Web3Auth({
    clientId,
    privateKeyProvider,
    web3AuthNetwork: 'testnet', // 이더리움 메인넷
  });

  useEffect(() => {
    console.log(
      'Initializing Web3Auth with the following chainConfig:',
      chainConfig,
    );
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    await web3auth.initModal();
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const logout = async () => {
    await web3auth.initModal();
    setProvider(null);
    setLoggedIn(false);
    await web3auth.logout();
  };

  useEffect(() => {
    const loadAccount = async () => {
      const accounts: any = await provider?.request({
        method: 'eth_accounts', // 이더리움 네트워크에서 계정을 가져오는 메서드
      });
      console.log(accounts);

      if (!accounts) {
        return;
      }
      console.log(accounts[0]);

      try {
        const balance = await provider?.request({
          method: 'eth_getBalance', // 이더리움 네트워크에서 잔액을 가져오는 메서드
          params: [accounts[0], 'latest'],
        });

        const account = accounts[0];
        console.log(account);
        console.log(balance);
        setAccount(account);

        if (balance) {
          const formattedBalance = ethers.formatEther(
            BigInt(balance.toString()),
          ); // 잔액을 ETH 단위로 변환
          setBalance(formattedBalance); // 변환된 잔액을 string 타입으로 설정
        } else {
          setBalance('0');
        }
      } catch (error) {
        console.error(error);
        setBalance('0');
      }
    };
    if (loggedIn) {
      loadAccount();
    }
  }, [loggedIn]);

  return (
    <>
      {loggedIn && account ? (
        <Button
          onClick={() => {
            logout();
          }}
        >
          {ellipsisAddress(account)} ( {balance} {chainConfig.ticker} )
        </Button>
      ) : (
        <Button
          onClick={() => {
            login();
          }}
        >
          Connect Wallet
        </Button>
      )}
    </>
  );
};
