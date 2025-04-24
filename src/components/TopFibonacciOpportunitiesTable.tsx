import React from 'react';
import { TopFibonacciOpportunity } from '@/types/fibonacci';
import { formatNumber } from '@/utils/formatters';

interface TopFibonacciOpportunitiesTableProps {
  opportunities: TopFibonacciOpportunity[];
  loading: boolean;
}

const TopFibonacciOpportunitiesTable: React.FC<TopFibonacciOpportunitiesTableProps> = ({
  opportunities,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-3 rounded-lg my-4 text-center">
        No Fibonacci opportunities detected at this time.
      </div>
    );
  }

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
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              % Spike
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Fibo Level
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Current Price
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {opportunities.map((opportunity, index) => (
            <tr 
              key={opportunity.symbol} 
              className={`hover:bg-gray-800/50 ${index < 3 ? 'bg-gray-800/30' : ''}`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${index === 0 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500' : 
                    index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400' : 
                    index === 2 ? 'bg-amber-700/20 text-amber-300 border border-amber-700' : 
                    'bg-gray-800 text-gray-400 border border-gray-700'}
                `}>
                  {index + 1}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                {opportunity.symbol}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-400">
                +{opportunity.percentageIncrease.toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getFibonacciBadgeColor(opportunity.fibonacciLevel)}`}>
                  {opportunity.fibonacciLevel.toFixed(3)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                {formatNumber(opportunity.price, opportunity.price < 1 ? 6 : 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopFibonacciOpportunitiesTable;
