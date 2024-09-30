# Scrollipop

Scrollipop offers simplicity and convenience for both users using second hand market platform.


# 🤔 Background
Scrollipop is a platform developed to provide safer and more enjoyable second-hand transactions. Second-hand trading always comes with its risks. In Korea, safer trading methods often involve intermediaries who charge fees to mitigate these risks. Scrollipop addresses this challenge by bypassing intermediaries and allowing users to deposit funds into smart contracts, use zkProof to verify their assets, and negotiate with others in a rational manner. Additionally, Scrollipop introduces a novel competitive game for negotiating prices, unseen in other platforms.

When purchasing an item from a seller, once the buyer's **sufficient assets are verified through zk Proof**, the buyer can propose a price and simultaneously deposit the funds. As soon as the seller accepts this, **a real-time game begins!**

The real-time game is quite simple. **The final price is determined by the ratio of taps on the screen.** The buyer will aim to lower the price, while the seller will work to increase it.

Once the game ends, the **purchase is automatically completed at the final price.** Any remaining assets after the purchase are returned to the buyer.

**In conclusion,** Scrollipop offers a playful way to ease the stress of negotiating in second-hand transactions, providing a more decentralized method of trading.

# Key Feature
1. Safely prove assets using Zero-Knowledge Proofs (ZKP).
2. Compete with traders in price games!
3. Buy and sell second-hand items with just one touch.

# ✨ Alchemy use note
`hardhat.config.ts`

```
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
```

# 🔑 SmartContracts
[MockGroth16Verifier](contracts/MockGroth16Verifier.sol)  
[Verifier](contracts/Verifier/sol)  
[ZKGameTradingContract](contracts/ZKGameTradingContract.sol)



<summary>
  Getting Started
</summary>
<div markdown="1">
  
  This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
  
  ## Getting Started
  
  First, run the development server:
  
  ```bash
  npm run dev
  # or
  yarn dev
  # or
  pnpm dev
  # or
  bun dev
  ```
  
  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
  
  You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
  
  This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
  
  ## Learn More
  
  To learn more about Next.js, take a look at the following resources:
  
  - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
  - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
  
  You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
  
  ## Deploy on Vercel
  
  The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
  
  Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

</div>
</details>