import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Volume Spike Tracker',
  description: 'Track volume spikes on Binance at different time intervals',
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
          <Header />
          <main className="flex-grow py-4">
            {children}
          </main>
          <footer className="bg-white dark:bg-gray-800 shadow-inner py-4">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© {new Date().getFullYear()} Volume Spike Tracker. All data provided by Binance API.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
