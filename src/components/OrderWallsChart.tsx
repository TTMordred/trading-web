import React, { useMemo } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Legend,
  TooltipProps,
} from 'recharts';
import { OrderWall } from '@/types/orderbook';

interface OrderWallsChartProps {
  orderWalls: OrderWall[];
  currentPrice?: number;
}

// Custom tooltip component
interface CustomTooltipProps extends TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  const dataPoint = payload[0].payload;
  const isBid = dataPoint.type === 'bid';
  const orderTypeColor = isBid ? 'bg-green-600' : 'bg-red-600';
  const orderTypeText = isBid ? 'BUY' : 'SELL';

  return (
    <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 text-gray-800">
      <div className={`${orderTypeColor} text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block`}>
        {orderTypeText} ORDER
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 p-2 rounded">
          <p className="text-xs text-gray-500">Price</p>
          <p className="font-bold text-lg">${label}</p>
        </div>

        <div className="bg-gray-100 p-2 rounded">
          <p className="text-xs text-gray-500">Volume</p>
          <p className={`font-bold text-lg ${isBid ? 'text-green-600' : 'text-red-600'}`}>
            {(dataPoint.value / 1000).toFixed(0)}K USDT
          </p>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200">
        {dataPoint.cumulativeBidVolume && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Cumulative Buy:</span>
            <span className="font-semibold text-green-600">
              {(dataPoint.cumulativeBidVolume / 1000).toFixed(0)}K USDT
            </span>
          </div>
        )}
        {dataPoint.cumulativeAskVolume && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Cumulative Sell:</span>
            <span className="font-semibold text-red-600">
              {(dataPoint.cumulativeAskVolume / 1000).toFixed(0)}K USDT
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Legend formatter component
const LegendFormatter = (value: string) => {
  const colorMap: Record<string, string> = {
    'Order Volume': '#8884d8',
    'Cumulative Short Liquidation Leverage': '#10b981',
    'Cumulative Long Liquidation Leverage': '#ef4444',
    'Short': '#10b981',
    'Long': '#ef4444',
    'Buy Orders': '#10b981',
    'Sell Orders': '#ef4444'
  };

  // Map to more user-friendly names
  const nameMap: Record<string, string> = {
    'Order Volume': 'Order Volume',
    'Cumulative Short Liquidation Leverage': 'Cumulative Buy Volume',
    'Cumulative Long Liquidation Leverage': 'Cumulative Sell Volume',
    'Short': 'Buy',
    'Long': 'Sell'
  };

  const displayName = nameMap[value] || value;

  // Determine background color based on value type
  let backgroundColor = 'transparent';
  if (value.includes('Buy') || value.includes('Short')) {
    backgroundColor = 'rgba(16, 185, 129, 0.1)';
  } else if (value.includes('Sell') || value.includes('Long')) {
    backgroundColor = 'rgba(239, 68, 68, 0.1)';
  }

  return (
    <span style={{
      color: colorMap[value] || '#fff',
      backgroundColor,
      padding: '2px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }}>
      {displayName}
    </span>
  );
};

const OrderWallsChart: React.FC<OrderWallsChartProps> = ({
  orderWalls,
  currentPrice,
}) => {
  // Process data regardless of empty check
  const sortedWalls = useMemo(() =>
    [...orderWalls].sort((a, b) => a.price - b.price),
    [orderWalls]
  );

  const data = useMemo(() => {
    let cumulativeBidVolume = 0;
    let cumulativeAskVolume = 0;

    return sortedWalls.map((wall) => {
      const value = wall.price * wall.quantity;

      if (wall.type === 'bid') {
        cumulativeBidVolume += value;
      } else {
        cumulativeAskVolume += value;
      }

      return {
        price: wall.price.toFixed(2),
        value: value,
        type: wall.type,
        cumulativeBidVolume: wall.type === 'bid' ? cumulativeBidVolume : null,
        cumulativeAskVolume: wall.type === 'ask' ? cumulativeAskVolume : null,
      };
    });
  }, [sortedWalls]);

  // Check for empty data after processing
  if (orderWalls.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative my-4">
        No significant order walls detected.
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Order Walls
        </h2>
        {currentPrice && (
          <div className="text-white bg-blue-600 px-3 py-1 rounded-md">
            Current Price: <span className="font-bold">${currentPrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            dataKey="price"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fill: '#8a8a9a' }}
            axisLine={{ stroke: '#2a2a3e' }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            label={{ value: 'Volume (USDT)', angle: -90, position: 'insideLeft', fill: '#8a8a9a' }}
            tick={{ fill: '#8a8a9a' }}
            axisLine={{ stroke: '#2a2a3e' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            label={{ value: 'Cumulative Volume', angle: 90, position: 'insideRight', fill: '#8a8a9a' }}
            tick={{ fill: '#8a8a9a' }}
            axisLine={{ stroke: '#2a2a3e' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={LegendFormatter}
          />

          {/* Bar charts for order volumes - split into buy and sell */}
          <Bar
            yAxisId="left"
            dataKey={(data) => data.type === 'bid' ? data.value : 0}
            name="Buy Orders"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            stackId="stack"
          />
          <Bar
            yAxisId="left"
            dataKey={(data) => data.type === 'ask' ? data.value : 0}
            name="Sell Orders"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            stackId="stack"
          />

          {/* Area charts for cumulative volumes */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeBidVolume"
            name="Cumulative Buy Volume"
            stroke="#10b981"
            fill="rgba(16, 185, 129, 0.2)"
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeAskVolume"
            name="Cumulative Sell Volume"
            stroke="#ef4444"
            fill="rgba(239, 68, 68, 0.2)"
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
          />

          {/* Current price reference line */}
          {currentPrice && (
            <ReferenceLine
              x={currentPrice.toFixed(2)}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              yAxisId="left"
              label={{
                value: 'Current Price',
                position: 'top',
                fill: '#3b82f6',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderWallsChart;
