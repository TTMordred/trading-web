'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TimeIntervalSelector from '@/components/TimeIntervalSelector';
import VolumeSpikesTable from '@/components/VolumeSpikesTable';
import { TimeInterval } from '@/types/binance';
import { useVolumeSpikes } from '@/hooks/useVolumeSpikes';

// Dynamically import the chart component to avoid SSR issues with Recharts
const VolumeChart = dynamic(() => import('@/components/VolumeChart'), {
  ssr: false,
});

export default function Home() {
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('15m');
  const { volumeSpikes, loading, error } = useVolumeSpikes(selectedInterval);

  const handleIntervalChange = (interval: TimeInterval) => {
    setSelectedInterval(interval);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Binance Volume Spike Tracker
      </h1>

      <div className="mb-4 text-center text-gray-600 dark:text-gray-400">
        Track volume spikes at different time intervals (M15, H1, H4, D1)
      </div>

      <TimeIntervalSelector
        selectedInterval={selectedInterval}
        onIntervalChange={handleIntervalChange}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          {error}
        </div>
      )}

      <VolumeSpikesTable
        volumeSpikes={volumeSpikes}
        loading={loading}
      />

      {!loading && volumeSpikes.length > 0 && (
        <VolumeChart volumeSpikes={volumeSpikes} limit={10} />
      )}

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>Data refreshes automatically every minute. Volume spikes are detected when the current volume exceeds the average volume by 2x or more.</p>
      </div>
    </div>
  );
}
