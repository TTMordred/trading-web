import React from 'react';
import { RecentVolumeSpikeData } from '@/types/binance';
import { formatPrice } from '@/utils/formatters';
import FibonacciVisualizer from './FibonacciVisualizer';

interface TopOpportunitiesProps {
  opportunities: RecentVolumeSpikeData[];
  loading: boolean;
}

const TopOpportunities: React.FC<TopOpportunitiesProps> = ({
  opportunities,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-gray-800/80 border border-purple-500/30 text-gray-300 px-6 py-4 rounded-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>No trading opportunities found at Fibonacci levels. Check back soon.</span>
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900/70 rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-gray-800/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Spike %
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Fibo Level
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Current Price
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
          {opportunities.map((opportunity, index) => (
            <tr key={opportunity.symbol} className="hover:bg-purple-900/20 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < 3 ? 'bg-gradient-to-br from-yellow-500 to-amber-700' : 'bg-gray-700'}`}>
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-white">{opportunity.symbol.replace('USDT', '')}</div>
                  <div className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">USDT</div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-green-400">
                  +{opportunity.percentageIncrease.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">Volume Spike</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1.5 text-xs font-semibold rounded-md text-white ${getFiboBadgeColor(opportunity.fiboLevel)}`}>
                  {opportunity.fiboLevel ? opportunity.fiboLevel.toFixed(3) : 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">{formatPrice(opportunity.currentPrice)}</div>
                <div className="text-xs text-gray-500">USDT</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <FibonacciVisualizer
                  fibLevels={[
                    { level: 0.5, price: opportunity.lowPrice + (opportunity.peakPrice - opportunity.lowPrice) * 0.5 },
                    { level: 0.618, price: opportunity.lowPrice + (opportunity.peakPrice - opportunity.lowPrice) * 0.618 },
                    { level: 0.786, price: opportunity.lowPrice + (opportunity.peakPrice - opportunity.lowPrice) * 0.786 }
                  ]}
                  currentPrice={opportunity.currentPrice}
                  highPrice={opportunity.peakPrice}
                  lowPrice={opportunity.lowPrice}
                  width={120}
                  height={40}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    BUY
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopOpportunities;
