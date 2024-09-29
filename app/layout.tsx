// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import OfferModal from '@/components/ui/modal';
import OfferListenerWrapper from '@/components/offerListenrWrapper';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});
import Provider from '@/context';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'fleemarket',
  description: 'fleemarket',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          {children}
        </Provider>
      </body>
    </html>
  );
}
