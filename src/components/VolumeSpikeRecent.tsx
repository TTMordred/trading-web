import React from 'react';
import { RecentVolumeSpikeData, SignalType } from '@/types/binance';
import { formatPrice } from '@/utils/formatters';
import FibonacciVisualizer from './FibonacciVisualizer';

interface VolumeSpikeRecentProps {
  volumeSpikes: RecentVolumeSpikeData[];
  loading: boolean;
}

const VolumeSpikeRecent: React.FC<VolumeSpikeRecentProps> = ({
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
      <div className="bg-gray-800/80 border border-green-500/30 text-gray-300 px-6 py-4 rounded-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>No recent volume spikes at Fibonacci retracement levels. Check back soon.</span>
      </div>
    );
  }

  // Helper function to get Fibonacci badge color
  const getFiboBadgeColor = (level?: number) => {
    if (!level) return 'bg-gray-600';

    if (level === 0.5) return 'bg-blue-600';
    if (level === 0.618) return 'bg-green-600';
    if (level === 0.786) return 'bg-purple-600';

    return 'bg-gray-600';
  };

  // Helper function to get signal badge styling
  const getSignalBadgeStyle = (signalType: SignalType, signalStrength: number = 0) => {
    switch (signalType) {
      case 'BUY':
        return {
          bg: signalStrength > 80 ? 'bg-green-900/70' : 'bg-green-900/50',
          text: 'text-green-400',
          border: 'border-green-700/50',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'SELL':
        return {
          bg: signalStrength > 80 ? 'bg-red-900/70' : 'bg-red-900/50',
          text: 'text-red-400',
          border: 'border-red-700/50',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-800/50',
          text: 'text-gray-400',
          border: 'border-gray-700/50',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900/70 rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-gray-800/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Spike %
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Retrace @Fibo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Current Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Time Since Spike
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Fibo Chart
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Signal
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {volumeSpikes.map((spike) => (
            <tr key={spike.symbol} className="hover:bg-green-900/20 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-white">{spike.symbol.replace('USDT', '')}</div>
                  <div className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">USDT</div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-green-400">
                  +{spike.percentageIncrease.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">Volume Spike</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1.5 text-xs font-semibold rounded-md text-white ${getFiboBadgeColor(spike.fiboLevel)}`}>
                  {spike.fiboLevel ? spike.fiboLevel.toFixed(3) : 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">{formatPrice(spike.currentPrice)}</div>
                <div className="text-xs text-gray-500">USDT</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">{spike.timeSinceSpike}</div>
                <div className="text-xs text-gray-500">ago</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <FibonacciVisualizer
                  fibLevels={[
                    { level: 0.5, price: spike.lowPrice + (spike.peakPrice - spike.lowPrice) * 0.5 },
                    { level: 0.618, price: spike.lowPrice + (spike.peakPrice - spike.lowPrice) * 0.618 },
                    { level: 0.786, price: spike.lowPrice + (spike.peakPrice - spike.lowPrice) * 0.786 }
                  ]}
                  currentPrice={spike.currentPrice}
                  highPrice={spike.peakPrice}
                  lowPrice={spike.lowPrice}
                  width={120}
                  height={40}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  {(() => {
                    const style = getSignalBadgeStyle(spike.signalType, spike.signalStrength);
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                        {style.icon}
                        {spike.signalType}
                        {spike.signalStrength ? (
                          <span className="ml-1 text-xs opacity-70">({spike.signalStrength})</span>
                        ) : null}
                      </span>
                    );
                  })()}
                </div>
                {spike.trendDirection !== 'NEUTRAL' && (
                  <div className="text-xs text-center mt-1 text-gray-500">
                    Trend: {spike.trendDirection === 'UP' ? '↗️ Upward' : '↘️ Downward'}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VolumeSpikeRecent;
