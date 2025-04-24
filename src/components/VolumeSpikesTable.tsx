import React from 'react';
import { VolumeSpikeData } from '@/types/binance';
import { formatNumber } from '@/utils/formatters';

interface VolumeSpikesTableProps {
  volumeSpikes: VolumeSpikeData[];
  loading: boolean;
}

const VolumeSpikesTable: React.FC<VolumeSpikesTableProps> = ({
  volumeSpikes,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (volumeSpikes.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-3 rounded-lg my-4 text-center">
        No volume spikes detected for the selected time interval.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Current Vol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Avg Vol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              % Increase
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              24h Change
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {volumeSpikes.map((spike) => (
            <tr key={spike.symbol} className="hover:bg-gray-800/50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                {spike.symbol}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatNumber(spike.currentVolume, 0)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatNumber(spike.averageVolume, 0)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-400">
                +{spike.percentageIncrease.toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatNumber(spike.price, spike.price < 1 ? 6 : 2)}
              </td>
              <td
                className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                  spike.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {spike.priceChange24h >= 0 ? '+' : ''}
                {spike.priceChange24h.toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VolumeSpikesTable;
