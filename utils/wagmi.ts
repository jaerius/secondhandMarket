import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { cookieStorage, createStorage } from 'wagmi';
import { scroll, scrollSepolia } from 'wagmi/chains';

// Get projectId from https://cloud.walletconnect.com
export const projectId = '8d5217388f123bbeffad04b2c2648b13';

if (!projectId) throw new Error('Project ID is not defined');

export const metadata = {
  name: 'appkit-example-scroll',
  description: 'AppKit Example - Scroll',
  url: 'https://scrollapp.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Create wagmiConfig
const chains = [scroll, scrollSepolia] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  auth: {
    email: true, // default to true
    socials: ['google'],
    showWallets: true, // default to true
    walletFeatures: true, // default to true
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
