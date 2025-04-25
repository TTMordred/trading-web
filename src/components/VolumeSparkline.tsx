import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface VolumeSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const VolumeSparkline: React.FC<VolumeSparklineProps> = ({
  data,
  width = 100,
  height = 30,
  color = '#10b981',
}) => {
  // Convert data to format expected by recharts
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeSparkline;
