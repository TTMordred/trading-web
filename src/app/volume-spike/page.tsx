'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TimeIntervalSelector from '@/components/TimeIntervalSelector';
import VolumeSpikesTable from '@/components/VolumeSpikesTable';
import RecentVolumeSpikesTable from '@/components/RecentVolumeSpikesTable';
import FibonacciOpportunitiesTable from '@/components/FibonacciOpportunitiesTable';
import { TimeInterval } from '@/types/binance';
import { useEnhancedVolumeSpikes } from '@/hooks/useEnhancedVolumeSpikes';

// Dynamically import the chart component to avoid SSR issues with Recharts
const VolumeChart = dynamic(() => import('@/components/VolumeChart'), {
  ssr: false,
});

export default function VolumeSpikeTracker() {
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('15m');
  const {
    currentSpikes,
    recentSpikes,
    fibonacciOpportunities,
    loading,
    error
  } = useEnhancedVolumeSpikes(selectedInterval);

  const handleIntervalChange = (interval: TimeInterval) => {
    setSelectedInterval(interval);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Volume Spike Tracker Pro
        </h1>
        <div className="text-center text-blue-100">
          Professional trading signals based on volume spikes and Fibonacci retracements
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Select Time Interval
        </div>
        <TimeIntervalSelector
          selectedInterval={selectedInterval}
          onIntervalChange={handleIntervalChange}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          {error}
        </div>
      )}

      {/* Top Fibonacci Opportunities Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Top Fibonacci Opportunities</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            Coins with impressive volume spikes that have retraced to key Fibonacci levels (0.618 and 0.786)
          </div>
          <FibonacciOpportunitiesTable
            opportunities={fibonacciOpportunities}
            loading={loading}
          />
        </div>
      </div>

      {/* Current Volume Spikes Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Volume Spike Now</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            Coins currently experiencing significant volume spikes (2x or more above average)
          </div>
          <VolumeSpikesTable
            volumeSpikes={currentSpikes}
            loading={loading}
          />
        </div>
      </div>

      {/* Recent Volume Spikes Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Volume Spike Recent</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            Coins with recent volume spikes (1-24 hours) that have cooled down, creating potential entry points
          </div>
          <RecentVolumeSpikesTable
            volumeSpikes={recentSpikes}
            loading={loading}
          />
        </div>
      </div>

      {/* Chart Section - Only show for current spikes */}
      {!loading && currentSpikes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Top Volume Spikes Visualization</h2>
          <VolumeChart volumeSpikes={currentSpikes} limit={10} />
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Trading Strategy Guide</span>
        </div>
        <ul className="list-disc pl-6 space-y-1">
          <li><span className="font-medium text-blue-600 dark:text-blue-400">Top Opportunities:</span> Focus on coins that have retraced to key Fibonacci levels (0.618 and 0.786) after a volume spike.</li>
          <li><span className="font-medium text-green-600 dark:text-green-400">Volume Spike Now:</span> Monitor for immediate momentum trading opportunities.</li>
          <li><span className="font-medium text-purple-600 dark:text-purple-400">Recent Spikes:</span> Look for coins that have cooled down after a spike, potentially forming a base for the next move.</li>
        </ul>
        <p className="mt-2">Data refreshes automatically every 15 minutes. All times shown in your local timezone.</p>
      </div>
    </div>
  );
}
