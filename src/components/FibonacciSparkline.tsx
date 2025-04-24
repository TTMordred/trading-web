import React from 'react';
import {
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { FibonacciLevel } from '@/types/fibonacci';

interface FibonacciSparklineProps {
  data: { price: number; timestamp: number }[];
  fibLevels: FibonacciLevel[];
  currentPrice: number;
  width?: number;
  height?: number;
}

const FibonacciSparkline: React.FC<FibonacciSparklineProps> = ({
  data,
  fibLevels,
  currentPrice,
  width = 120,
  height = 40,
}) => {
  // Format data for the chart
  const chartData = data.map((point) => ({
    timestamp: point.timestamp,
    price: point.price,
  }));

  // Add current price point
  if (chartData.length > 0) {
    chartData.push({
      timestamp: Date.now(),
      price: currentPrice,
    });
  }

  // Define colors for Fibonacci levels
  const fibColors: Record<number, string> = {
    0.5: '#f59e0b',   // Amber-500
    0.618: '#10b981', // Emerald-500
    0.786: '#3b82f6', // Blue-500
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(4)}`, 'Price']}
          labelFormatter={() => ''}
          contentStyle={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            border: 'none',
            borderRadius: '4px',
            fontSize: '10px',
            padding: '4px'
          }}
        />
        
        {/* Fibonacci reference lines */}
        {fibLevels.map((level) => (
          <ReferenceLine
            key={level.level}
            y={level.price}
            stroke={fibColors[level.level] || '#6b7280'}
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        ))}
        
        {/* Price line */}
        <Line
          type="monotone"
          dataKey="price"
          stroke="#ffffff"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: '#ffffff', stroke: '#10b981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FibonacciSparkline;
