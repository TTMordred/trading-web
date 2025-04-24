import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { VolumeSpikeData } from '@/types/binance';
import { formatNumber } from '@/utils/formatters';

interface VolumeChartProps {
  volumeSpikes: VolumeSpikeData[];
  limit?: number;
}

const VolumeChart: React.FC<VolumeChartProps> = ({
  volumeSpikes,
  limit = 10,
}) => {
  // Take only the top N volume spikes
  const data = volumeSpikes.slice(0, limit).map((spike) => ({
    name: spike.symbol,
    currentVolume: spike.currentVolume,
    averageVolume: spike.averageVolume,
    percentageIncrease: spike.percentageIncrease,
  }));

  return (
    <div className="w-full h-96">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            tickFormatter={(value) => formatNumber(value, 0)}
            label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip
            formatter={(value: number) => [
              formatNumber(value),
              'Volume',
            ]}
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: 'none',
              borderRadius: '4px',
              color: '#E5E7EB'
            }}
          />
          <Legend
            wrapperStyle={{ color: '#9CA3AF' }}
          />
          <Bar
            dataKey="averageVolume"
            name="Average Volume"
            fill="#6366F1"
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
          <Bar
            dataKey="currentVolume"
            name="Current Volume"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeChart;
