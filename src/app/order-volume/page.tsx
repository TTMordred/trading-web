'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SymbolSelector from '@/components/SymbolSelector';
import OrderBookTable from '@/components/OrderBookTable';
import TimeScaleSelector, { TimeScale } from '@/components/TimeScaleSelector';
import VolumeConcentrationZones, { VolumeZone } from '@/components/VolumeConcentrationZones';
import { useOrderBook } from '@/hooks/useOrderBook';
import { calculateVolumeConcentrationZones } from '@/services/orderBookService';

// Dynamically import components that use canvas/charts to avoid SSR issues
const OrderBookHeatmap = dynamic(() => import('@/components/OrderBookHeatmap'), {
  ssr: false,
});

const OrderWallsChart = dynamic(() => import('@/components/OrderWallsChart'), {
  ssr: false,
});

export default function OrderVolumeTracker() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [selectedTimeScale, setSelectedTimeScale] = useState<TimeScale>('15m');
  const { orderBook, orderWalls, loading, error } = useOrderBook(selectedSymbol, selectedTimeScale);
  const [volumeZones, setVolumeZones] = useState<VolumeZone[]>([]);

  useEffect(() => {
    if (orderBook) {
      // Calculate volume concentration zones
      const zones = calculateVolumeConcentrationZones(orderBook);
      setVolumeZones(zones);
    }
  }, [orderBook]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleTimeScaleChange = (timeScale: TimeScale) => {
    setSelectedTimeScale(timeScale);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Binance Order Volume Tracker
      </h1>

      <div className="mb-4 text-center text-gray-600 dark:text-gray-400">
        Track significant order walls and market depth on Binance
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6">
        <SymbolSelector
          selectedSymbol={selectedSymbol}
          onSymbolChange={handleSymbolChange}
        />

        <TimeScaleSelector
          selectedTimeScale={selectedTimeScale}
          onTimeScaleChange={handleTimeScaleChange}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          {error}
        </div>
      )}

      {/* New Heatmap Component */}
      <OrderBookHeatmap
        orderBook={orderBook}
        timeScale={selectedTimeScale}
        symbol={selectedSymbol}
      />

      {/* Volume Concentration Zones */}
      <VolumeConcentrationZones zones={volumeZones} />

      {/* Original Order Book Table */}
      <OrderBookTable
        orderBook={orderBook}
        orderWalls={orderWalls}
        loading={loading}
      />

      {/* Order Walls Chart */}
      {!loading && orderWalls.length > 0 && (
        <OrderWallsChart orderWalls={orderWalls} />
      )}

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>Data refreshes automatically every 10 seconds. Order walls are detected when the order value exceeds 50,000 USDT.</p>
      </div>
    </div>
  );
}
