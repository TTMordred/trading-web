import React from 'react';
import { VolumeSpikeWithFibonacci } from '@/types/fibonacci';
import { formatNumber } from '@/utils/formatters';
import FibonacciSparkline from './FibonacciSparkline';
import ClientTime from '@/components/ClientTime';

interface RecentVolumeSpikesTableProps {
  recentSpikes: VolumeSpikeWithFibonacci[];
  loading: boolean;
}

const RecentVolumeSpikesTable: React.FC<RecentVolumeSpikesTableProps> = ({
  recentSpikes,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (recentSpikes.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-3 rounded-lg my-4 text-center">
        No recent volume spikes at Fibonacci levels detected.
      </div>
    );
  }

  // Function to format time since spike
  const formatTimeSince = (timeSinceSpike: number) => {
    const hours = Math.floor(timeSinceSpike / (1000 * 60 * 60));
    const minutes = Math.floor((timeSinceSpike % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Function to get badge color based on Fibonacci level
  const getFibonacciBadgeColor = (level: number) => {
    switch (level) {
      case 0.5:
        return 'bg-amber-900/60 text-amber-300 border-amber-500';
      case 0.618:
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-500';
      case 0.786:
        return 'bg-blue-900/60 text-blue-300 border-blue-500';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Spike At
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              % Spike
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Retrace @Fibo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Current Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Time Since Spike
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Chart
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {recentSpikes.map((spike) => (
            <tr key={spike.symbol} className="hover:bg-gray-800/50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                {spike.symbol}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {spike.fibonacci?.highTimestamp
                  ? <ClientTime format="time" timestamp={spike.fibonacci.highTimestamp} />
                  : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-400">
                +{spike.percentageIncrease.toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getFibonacciBadgeColor(spike.nearestFibonacciLevel ?? 0)}`}>
                  {spike.nearestFibonacciLevel?.toFixed(3) ?? '-'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatNumber(spike.price, spike.price < 1 ? 6 : 2)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                {formatTimeSince(spike.timeSinceSpike)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {spike.fibonacci && (
                  <FibonacciSparkline
                    data={[
                      { price: spike.fibonacci.high, timestamp: spike.fibonacci.highTimestamp },
                      { price: spike.fibonacci.low, timestamp: spike.fibonacci.highTimestamp - 3600000 }
                    ]}
                    fibLevels={spike.fibonacci.levels}
                    currentPrice={spike.price}
                  />
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
