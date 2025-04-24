import React from 'react';
import { OrderBook, OrderWall } from '@/types/orderbook';

interface OrderBookTableProps {
  orderBook: OrderBook | null;
  orderWalls: OrderWall[];
  loading: boolean;
}

const OrderBookTable: React.FC<OrderBookTableProps> = ({
  orderBook,
  orderWalls,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orderBook) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative my-4">
        No order book data available. Please try again later.
      </div>
    );
  }

  // Function to check if a price is an order wall
  const isOrderWall = (price: number, type: 'bid' | 'ask'): boolean => {
    return orderWalls.some(wall => wall.price === price && wall.type === type);
  };

  // Take only the top 10 bids and asks for display
  const topBids = orderBook.bids.slice(0, 10);
  const topAsks = orderBook.asks.slice(0, 10);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Bids (Buy Orders) */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-success">Bids (Buy Orders)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price (USDT)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total (USDT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {topBids.map((bid, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isOrderWall(bid.price, 'bid') ? 'bg-green-50 dark:bg-green-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">
                    {bid.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {bid.quantity.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {(bid.price * bid.quantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asks (Sell Orders) */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-danger">Asks (Sell Orders)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price (USDT)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total (USDT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {topAsks.map((ask, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isOrderWall(ask.price, 'ask') ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-danger">
                    {ask.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {ask.quantity.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {(ask.price * ask.quantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderBookTable;
