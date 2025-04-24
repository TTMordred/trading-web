import React from 'react';
import { VolumeSpikeData } from '@/types/binance';
import { formatNumberWithUnits, formatPrice } from '@/utils/formatters';
import MiniSparkline from './MiniSparkline';

interface VolumeSpikeNowProps {
  volumeSpikes: VolumeSpikeData[];
  loading: boolean;
}

const VolumeSpikeNow: React.FC<VolumeSpikeNowProps> = ({
  volumeSpikes,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (volumeSpikes.length === 0) {
    return (
      <div className="bg-gray-800/80 border border-blue-500/30 text-gray-300 px-6 py-4 rounded-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>No volume spikes detected in current candles. Check back soon.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Current Vol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Avg Vol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              % Increase
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Current Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              24h Change
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Sparkline
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {volumeSpikes.map((spike) => (
            <tr key={spike.symbol} className="hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                {spike.symbol.replace('USDT', '')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatNumberWithUnits(spike.currentVolume)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatNumberWithUnits(spike.averageVolume)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-400">
                +{spike.percentageIncrease.toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatPrice(spike.price)} USDT
              </td>
              <td
                className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                  spike.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {spike.priceChange24h >= 0 ? '+' : ''}
                {spike.priceChange24h.toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <MiniSparkline
                  data={[0.5, 0.3, 0.6, 0.8, 0.4, 0.7, 1]}
                  color={spike.priceChange24h >= 0 ? '#10b981' : '#ef4444'}
                  fillColor={spike.priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VolumeSpikeNow;
