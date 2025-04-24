'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SymbolSelector from '@/components/SymbolSelector';
import OrderBookTable from '@/components/OrderBookTable';
import VolumeConcentrationZones, { VolumeZone } from '@/components/VolumeConcentrationZones';
import { useOrderBook } from '@/hooks/useOrderBook';
import { calculateVolumeConcentrationZones } from '@/services/orderBookService';

// Dynamically import components that use canvas/charts to avoid SSR issues
const OrderBookHeatmap = dynamic(() => import('@/components/OrderBookHeatmap'), {
  ssr: false,
});

const OrderBookHeatmapGrid = dynamic(() => import('@/components/OrderBookHeatmapGrid'), {
  ssr: false,
});

const OrderBookHeatmapWithCandles = dynamic(() => import('@/components/OrderBookHeatmapWithCandles'), {
  ssr: false,
});

export default function OrderVolumeTracker() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const { orderBook, orderWalls, loading, error } = useOrderBook(selectedSymbol);
  const [volumeZones, setVolumeZones] = useState<VolumeZone[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (orderBook) {
      // Calculate volume concentration zones
      const zones = calculateVolumeConcentrationZones(orderBook);
      setVolumeZones(zones);
      setLastUpdated(new Date());
    }
  }, [orderBook]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  // Calculate some stats for the header
  const totalBidVolume = orderBook?.bids.reduce((sum, bid) => sum + (bid.price * bid.quantity), 0) ?? 0;
  const totalAskVolume = orderBook?.asks.reduce((sum, ask) => sum + (ask.price * ask.quantity), 0) ?? 0;
  const volumeRatio = totalBidVolume && totalAskVolume ? (totalBidVolume / totalAskVolume).toFixed(2) : '0';

  // Estimate current price (midpoint between highest bid and lowest ask)
  const highestBid = orderBook?.bids.length ? Math.max(...orderBook.bids.map(bid => bid.price)) : 0;
  const lowestAsk = orderBook?.asks.length ? Math.min(...orderBook.asks.map(ask => ask.price)) : 0;
  const currentPrice = highestBid && lowestAsk ? ((highestBid + lowestAsk) / 2).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header with stats */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white mb-2 md:mb-0">
              Order Volume Tracker
            </h1>

            <div className="flex flex-wrap gap-2">
              <div className="bg-blue-900/50 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-xs text-blue-300">Current Price</span>
                <span className="text-xl font-bold text-blue-400">${currentPrice}</span>
              </div>

              <div className="bg-green-900/50 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-xs text-green-300">Buy Volume</span>
                <span className="text-xl font-bold text-green-400">
                  {(totalBidVolume / 1000000).toFixed(2)}M
                </span>
              </div>

              <div className="bg-red-900/50 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-xs text-red-300">Sell Volume</span>
                <span className="text-xl font-bold text-red-400">
                  {(totalAskVolume / 1000000).toFixed(2)}M
                </span>
              </div>

              <div className="bg-purple-900/50 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-xs text-purple-300">Buy/Sell Ratio</span>
                <span className="text-xl font-bold text-purple-400">{volumeRatio}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-gray-400 max-w-md">
              Visualize order book depth and market liquidity with multiple heatmap views
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <SymbolSelector
                selectedSymbol={selectedSymbol}
                onSymbolChange={handleSymbolChange}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg my-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Main content grid */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Order Book Heatmap */}
              <OrderBookHeatmap
                orderBook={orderBook}
                symbol={selectedSymbol}
              />

              {/* Order Book Heatmap Grid */}
              <OrderBookHeatmapGrid
                orderBook={orderBook}
                symbol={selectedSymbol}
              />

              {/* Order Book Heatmap with Candles */}
              <OrderBookHeatmapWithCandles
                orderBook={orderBook}
                symbol={selectedSymbol}
              />

              {/* Volume Concentration Zones */}
              <VolumeConcentrationZones zones={volumeZones} />
            </div>

            {/* Order Book Table */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Order Book Details</h2>
              <OrderBookTable
                orderBook={orderBook}
                orderWalls={orderWalls}
                loading={false}
              />
            </div>
          </>
        )}

        <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-400 flex justify-between items-center">
          <div>
            <p>Green/red bars show individual orders. Curved lines show cumulative volume.</p>
            <p className="mt-1">Heatmap views show order density with color intensity indicating volume.</p>
            <p className="mt-1">Hover over any part of the heatmaps to see detailed information.</p>
            <p className="mt-1">Showing the full order book range with all available orders.</p>
          </div>
          <div className="text-right">
            <p>Last updated: <span suppressHydrationWarning>{lastUpdated.toLocaleTimeString()}</span></p>
            <p>Data refreshes automatically every 10 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
