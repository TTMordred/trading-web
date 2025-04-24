import React, { useMemo } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
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

  // Price data is already in the payload

  return (
    <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 text-gray-800">
      <div className={`${orderTypeColor} text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block`}>
        {orderTypeText} ORDER
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 p-2 rounded">
          <p className="text-xs text-gray-500">Price</p>
          <p className="font-bold text-lg">${dataPoint.fullPrice ?? label}</p>
          {dataPoint.chartCurrentPrice && (
            <p className="text-xs mt-1">
              {parseFloat(dataPoint.fullPrice) < dataPoint.chartCurrentPrice ?
                <span className="text-green-600">-${(dataPoint.chartCurrentPrice - parseFloat(dataPoint.fullPrice)).toFixed(2)}</span> :
                <span className="text-red-600">+${(parseFloat(dataPoint.fullPrice) - dataPoint.chartCurrentPrice).toFixed(2)}</span>
              } from current
            </p>
          )}
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

// Removed LegendFormatter since we're not using it anymore

const OrderWallsChart: React.FC<OrderWallsChartProps> = ({
  orderWalls,
  currentPrice,
}) => {
  // Process data regardless of empty check
  const sortedWalls = useMemo(() =>
    [...orderWalls].sort((a, b) => a.price - b.price),
    [orderWalls]
  );

  // Calculate price range for display
  const priceRange = useMemo(() => {
    const prices = sortedWalls.map(wall => wall.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return {
      min: minPrice.toFixed(2),
      max: maxPrice.toFixed(2),
      range: maxPrice - minPrice
    };
  }, [sortedWalls]);

  const data = useMemo(() => {
    let cumulativeBidVolume = 0;
    let cumulativeAskVolume = 0;

    // Determine if we need to show full price or just last digits
    const showFullPrice = priceRange.range < 10; // Show full price if range is small

    return sortedWalls.map((wall) => {
      const value = wall.price * wall.quantity;

      if (wall.type === 'bid') {
        cumulativeBidVolume += value;
      } else {
        cumulativeAskVolume += value;
      }

      // Format price for display
      const fullPrice = wall.price.toFixed(2);
      const shortPrice = wall.price > 1000 ?
        fullPrice.slice(-5) : // Show last 5 chars (including decimal) for high prices
        fullPrice;

      return {
        price: showFullPrice ? fullPrice : shortPrice,
        fullPrice: fullPrice, // Keep full price for tooltip
        value: value,
        type: wall.type,
        chartCurrentPrice: currentPrice, // Add current price for tooltip comparison
        cumulativeBidVolume: wall.type === 'bid' ? cumulativeBidVolume : null,
        cumulativeAskVolume: wall.type === 'ask' ? cumulativeAskVolume : null,
      };
    });
  }, [sortedWalls, currentPrice]);

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

      <div className="relative w-full h-[90%]">
        {/* Price labels at the edges */}
        <div className="absolute bottom-0 left-0 text-gray-400 text-sm font-mono z-10">
          {priceRange.min}
        </div>
        <div className="absolute bottom-0 right-0 text-gray-400 text-sm font-mono z-10">
          {priceRange.max}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
          <CartesianGrid vertical={false} stroke="#2a2a3e" strokeOpacity={0.3} />
          <XAxis
            dataKey="price"
            axisLine={false}
            tickLine={false}
            tick={false}
            height={30}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => `${value === 0 ? '0' : (value / 1000).toFixed(0) + 'K'}`}
            tick={{ fill: '#8a8a9a' }}
            axisLine={false}
            tickLine={false}
            tickCount={2}
            domain={[0, 'dataMax']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value === 0 ? '0' : (value / 1000).toFixed(0) + 'K'}`}
            tick={{ fill: '#8a8a9a' }}
            axisLine={false}
            tickLine={false}
            tickCount={2}
            domain={[0, 'dataMax']}
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Legend removed to match reference design */}

          {/* Bar charts for order volumes - split into buy and sell */}
          <Bar
            yAxisId="left"
            dataKey={(data) => data.type === 'bid' ? data.value : 0}
            name="Buy Orders"
            fill="#10b981"
            minPointSize={2}
            barSize={2}
            stackId="stack"
          />
          <Bar
            yAxisId="left"
            dataKey={(data) => data.type === 'ask' ? data.value : 0}
            name="Sell Orders"
            fill="#ef4444"
            minPointSize={2}
            barSize={2}
            stackId="stack"
          />

          {/* Area charts for cumulative volumes - hidden for now to match reference design */}
          {/*
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
          */}

          {/* Current price reference line */}
          {currentPrice && (
            <ReferenceLine
              x={currentPrice.toFixed(2)}
              stroke="#3b82f6"
              strokeWidth={1}
              strokeDasharray="3 3"
              yAxisId="left"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderWallsChart;
