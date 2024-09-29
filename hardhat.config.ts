import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545', // Hardhat의 기본 로컬 주소
    },
    sepolia: {
      url:
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
        'https://eth-sepolia.g.alchemy.com/v2/CAg7OLEoHDdLQXA_P8tWRCQ_SND4RYt8', // Sepolia RPC URL
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // Private key of your wallet
    },
    scrollTestnet: {
      url:
        process.env.SCROLL_TESTNET_URL ||
        'https://scroll-sepolia.g.alchemy.com/v2/CAg7OLEoHDdLQXA_P8tWRCQ_SND4RYt8',
      accounts: process.env.SCROLL_PRIVATE_KEY
        ? [process.env.SCROLL_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    apiKey: {
      scrollSepolia: 'CAg7OLEoHDdLQXA_P8tWRCQ_SND4RYt8',
    },
    customChains: [
      {
        network: 'scrollSepolia',
        chainId: 534351,
        urls: {
          apiURL:
            'https://scroll-sepolia.g.alchemy.com/v2/CAg7OLEoHDdLQXA_P8tWRCQ_SND4RYt8',
          browserURL: 'https://sepolia.scrollscan.com/',
        },
      },
    ],
  },
};
export default config;
