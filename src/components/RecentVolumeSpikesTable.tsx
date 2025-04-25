import React from 'react';
import { VolumeSpikeData } from '@/types/binance';

interface RecentVolumeSpikesTableProps {
  volumeSpikes: VolumeSpikeData[];
  loading: boolean;
}

const RecentVolumeSpikesTable: React.FC<RecentVolumeSpikesTableProps> = ({
  volumeSpikes,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (volumeSpikes.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative my-4">
        No recent volume spikes that have cooled down. Check back later.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Spike Volume
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Avg Volume
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Increase (%)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Current Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Fibo Level
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {volumeSpikes.map((spike) => (
            <tr 
              key={spike.symbol} 
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {spike.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {spike.currentVolume.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {spike.averageVolume.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">
                +{spike.percentageIncrease.toFixed(2)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {spike.price.toFixed(8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {spike.fibonacci?.nearestLevel ? (
                  <span className={`px-2 py-1 rounded-md font-medium ${
                    spike.fibonacci.nearestLevel === 0.618 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : spike.fibonacci.nearestLevel === 0.786
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {spike.fibonacci.nearestLevel.toFixed(3)}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentVolumeSpikesTable;
