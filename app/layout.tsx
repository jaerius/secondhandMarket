// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import OfferModal from '@/components/ui/modal';
import OfferListenerWrapper from '@/components/offerListenrWrapper';
import { WagmiStateManager } from '@/components/wagmiStateManager';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});
import Provider from '@/context';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { headers } from 'next/headers';
import TradeAcceptedModal from '@/components/ui/tradeAcceptedModal';
import { cookieToInitialState } from 'wagmi';
import { config } from '@/utils/wagmi';
import Web3ModalProvider from '@/components/wagmiModal';

export const metadata: Metadata = {
  title: 'fleemarket',
  description: 'fleemarket',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'));
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <Provider>
          <Header />
          <OfferListenerWrapper />
          <OfferModal />
          <TradeAcceptedModal />
          <Web3ModalProvider initialState={initialState}>
            <WagmiStateManager />
            {children}
          </Web3ModalProvider>
        </Provider>
      </body>
    </html>
  );
}
