'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SymbolSelector from '@/components/SymbolSelector';
import OrderBookTable from '@/components/OrderBookTable';
import { useOrderBook } from '@/hooks/useOrderBook';

// Dynamically import the chart component to avoid SSR issues with Recharts
const OrderWallsChart = dynamic(() => import('@/components/OrderWallsChart'), {
  ssr: false,
});

export default function OrderVolumeTracker() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const { orderBook, orderWalls, loading, error } = useOrderBook(selectedSymbol);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Binance Order Volume Tracker
      </h1>

      <div className="mb-4 text-center text-gray-600 dark:text-gray-400">
        Track significant order walls and market depth on Binance
      </div>

      <SymbolSelector
        selectedSymbol={selectedSymbol}
        onSymbolChange={handleSymbolChange}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          {error}
        </div>
      )}

      <OrderBookTable
        orderBook={orderBook}
        orderWalls={orderWalls}
        loading={loading}
      />

      {!loading && orderWalls.length > 0 && (
        <OrderWallsChart orderWalls={orderWalls} />
      )}

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>Data refreshes automatically every 10 seconds. Order walls are detected when the order value exceeds 50,000 USDT.</p>
      </div>
    </div>
  );
}
