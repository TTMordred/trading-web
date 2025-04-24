import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { OrderWall } from '@/types/orderbook';

interface OrderWallsChartProps {
  orderWalls: OrderWall[];
  currentPrice?: number;
}

const OrderWallsChart: React.FC<OrderWallsChartProps> = ({
  orderWalls,
  currentPrice,
}) => {
  if (orderWalls.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative my-4">
        No significant order walls detected.
      </div>
    );
  }

  // Sort order walls by price
  const sortedWalls = [...orderWalls].sort((a, b) => a.price - b.price);

  // Prepare data for the chart
  const data = sortedWalls.map((wall) => ({
    price: wall.price.toFixed(2),
    value: wall.price * wall.quantity,
    type: wall.type,
  }));

  return (
    <div className="w-full h-96 mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Order Walls
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="price"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            label={{ value: 'Volume (USDT)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${(value / 1000).toFixed(0)}K USDT`,
              'Volume',
            ]}
          />
          <Bar
            dataKey="value"
            name="Order Volume"
            fill={(data: any) => (data.type === 'bid' ? '#10b981' : '#ef4444')}
          />
          {currentPrice && (
            <ReferenceLine
              x={currentPrice.toFixed(2)}
              stroke="#3b82f6"
              strokeWidth={2}
              label={{
                value: 'Current Price',
                position: 'top',
                fill: '#3b82f6',
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderWallsChart;
