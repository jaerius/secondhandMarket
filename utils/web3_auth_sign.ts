import { ethers } from 'ethers';
import { Web3Auth } from '@web3auth/modal';
import { IProvider } from '@web3auth/base';
import { web3auth } from './web3-auth';
import { BrowserProvider } from 'ethers';

// Web3Auth 인스턴스
web3auth.initModal();

// Web3Auth provider를 ethers BrowserProvider로 변환하는 함수
function getEthersProvider(web3authProvider: IProvider): BrowserProvider {
  return new BrowserProvider(web3authProvider as any);
}

// 사용 예시
export async function getWeb3AuthSigner() {
  if (!web3auth.provider) {
    throw new Error('Web3Auth is not initialized');
  }

  const ethersProvider = getEthersProvider(web3auth.provider);
  return ethersProvider.getSigner();
}
