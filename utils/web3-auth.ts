import { CHAIN_NAMESPACES } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'; // 이더리움용 PrivateKeyProvider로 변경
import { Web3Auth } from '@web3auth/modal';

const clientId =
  'BGUM9pLACidLnpI8zYVxTONoaKHV59U8-5Cw9vjdLaIn9r6RU0TLCItXpLsDjVQPAcfcWKlWVm9CDU5mBlElX0M';

// 이더리움 네트워크 관련 설정
export const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155, // EVM 기반 네트워크
  chainId: '0xaa36a7', // Ethereum 메인넷 체인 ID (0x1 = 메인넷, 0x5 = Goerli 테스트넷)
  rpcTarget:
    'https://eth-mainnet.g.alchemy.com/v2/CAg7OLEoHDdLQXA_P8tWRCQ_SND4RYt8', // Infura 또는 다른 RPC 제공자 사용 가능
  wsTarget: 'wss://mainnet.infura.io/ws/v3/YOUR_INFURA_PROJECT_ID', // 웹소켓 RPC (선택 사항)
  ticker: 'ETH',
  logo: 'https://web3auth.io/images/web3auth-logo.svg',
  tickerName: 'Ethereum',
  displayName: 'Ethereum Testnet',
  blockExplorerUrl: 'https://etherscan.io', // 이더리움 블록 익스플로러
  clientId: '',
};

// 이더리움 전용 PrivateKeyProvider
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export const web3auth = new Web3Auth({
  clientId,
  uiConfig: {
    logoLight: 'https://web3auth.io/images/web3auth-logo.svg',
    logoDark: 'https://web3auth.io/images/web3auth-logo---Dark.svg',
  },
  privateKeyProvider,
  web3AuthNetwork: 'mainnet', // 이더리움 메인넷
});
