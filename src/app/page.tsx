'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Binance Trading Tools
      </h1>

      <div className="mb-12 text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        <p>A collection of professional tools for cryptocurrency traders using Binance exchange.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Volume Spike Tool */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Volume Spike Tracker</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Identify cryptocurrencies with unusual trading volume that may indicate potential price movements. Track volume spikes across multiple timeframes.
            </p>
            <ul className="mb-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Multi-timeframe analysis (15m, 1h, 4h, 1d)
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Automatic sorting by percentage increase
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Real-time data updates every minute
              </li>
            </ul>
            <Link
              href="/volume-spike"
              className="block w-full text-center bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Open Volume Spike Tracker
            </Link>
          </div>
        </div>

        {/* Order Volume Tool */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Order Volume Tracker</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Visualize order book depth and identify significant buy/sell walls. Analyze market liquidity and potential support/resistance levels.
            </p>
            <ul className="mb-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Detect large buy/sell walls (>50,000 USDT)
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Visual representation of market depth
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Real-time data updates every 10 seconds
              </li>
            </ul>
            <Link
              href="/order-volume"
              className="block w-full text-center bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Open Order Volume Tracker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
