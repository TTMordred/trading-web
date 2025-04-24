'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TimeIntervalSelector from '@/components/TimeIntervalSelector';
import VolumeSpikeNow from '@/components/VolumeSpikeNow';
import VolumeSpikeRecent from '@/components/VolumeSpikeRecent';
import TopOpportunities from '@/components/TopOpportunities';
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
    topOpportunities,
    loading,
    error
  } = useEnhancedVolumeSpikes(selectedInterval);

  const handleIntervalChange = (interval: TimeInterval) => {
    setSelectedInterval(interval);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 mb-8 shadow-lg border border-purple-700/30">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                <span className="text-yellow-400">⚡</span> Volume Spike <span className="text-purple-400">Signals</span>
              </h1>
              <p className="text-gray-300 mb-4">
                Professional trading signals based on volume spikes and Fibonacci retracement levels
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <TimeIntervalSelector
                selectedInterval={selectedInterval}
                onIntervalChange={handleIntervalChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="text-white font-medium">{new Date().toLocaleTimeString()}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Timeframe</div>
              <div className="text-white font-medium">{selectedInterval}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Signals Found</div>
              <div className="text-white font-medium">
                {topOpportunities.length + currentSpikes.length + recentSpikes.length}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded-lg my-4">
            {error}
          </div>
        )}

      {/* Section 1: Top Opportunities - Now at the top */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            <span className="text-yellow-400">★</span> Top Fibonacci Opportunities
          </h2>
          <div className="text-sm text-gray-400">
            Best trading setups at key Fibonacci levels
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg p-5 shadow-lg border border-purple-700/50">
          <TopOpportunities
            opportunities={topOpportunities}
            loading={loading}
          />
        </div>
      </div>

      {/* Section 2: Current Volume Spikes */}
      <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Volume Spike Now</h2>
          <div className="text-sm text-gray-400">
            Coins with volume spikes in the current candle
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-800">
          <VolumeSpikeNow
            volumeSpikes={currentSpikes}
            loading={loading}
          />
        </div>
      </div>

      {/* Section 3: Recent Volume Spikes at Fibonacci Levels */}
      <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Volume Spike Recent</h2>
          <div className="text-sm text-gray-400">
            Recent spikes (1-24h) at key Fibonacci retracement levels
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-800">
          <VolumeSpikeRecent
            volumeSpikes={recentSpikes}
            loading={loading}
          />
        </div>
      </div>

      {/* Trading Strategy and Fibonacci Level Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-5 shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Trading Strategy
          </h3>
          <div className="space-y-2 text-gray-300">
            <p><span className="font-semibold text-purple-400">1.</span> Look for coins with significant volume spikes (2x or more above average)</p>
            <p><span className="font-semibold text-purple-400">2.</span> Wait for price to retrace to a key Fibonacci level (0.618 or 0.786 preferred)</p>
            <p><span className="font-semibold text-purple-400">3.</span> Enter a position when price shows signs of reversal at the Fibonacci level</p>
            <p><span className="font-semibold text-purple-400">4.</span> Set stop loss below the Fibonacci level and take profit at previous high</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-5 shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Fibonacci Retracement Levels
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center p-2 rounded bg-gray-800/50 border border-blue-600/30">
              <div className="w-4 h-4 rounded-full bg-blue-600 mr-3"></div>
              <div>
                <div className="font-semibold text-white">0.500</div>
                <div className="text-sm text-gray-400">Moderate retracement - Common reversal zone</div>
              </div>
            </div>
            <div className="flex items-center p-2 rounded bg-gray-800/50 border border-green-600/30">
              <div className="w-4 h-4 rounded-full bg-green-600 mr-3"></div>
              <div>
                <div className="font-semibold text-white">0.618</div>
                <div className="text-sm text-gray-400">Golden ratio - Strong support/resistance level</div>
              </div>
            </div>
            <div className="flex items-center p-2 rounded bg-gray-800/50 border border-purple-600/30">
              <div className="w-4 h-4 rounded-full bg-purple-600 mr-3"></div>
              <div>
                <div className="font-semibold text-white">0.786</div>
                <div className="text-sm text-gray-400">Deep retracement - Major support level</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 mb-8 text-center border border-gray-800">
        <p className="text-sm text-gray-400">
          Data refreshes automatically every minute. Volume spikes are detected when the current volume exceeds the average volume by 2x or more.
          Fibonacci retracement levels are calculated from the low to high price range of the spike movement.
        </p>
        <div className="mt-3 flex justify-center space-x-4">
          <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleString()}</span>
          <span className="text-xs text-gray-500">Timeframe: {selectedInterval}</span>
        </div>
      </div>
    </div>
    </div>
  );
}
