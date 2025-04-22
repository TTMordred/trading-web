import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    <div className="w-full h-96 mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Top {limit} Volume Spikes
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
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tickFormatter={(value) => formatNumber(value, 0)}
            label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => [
              formatNumber(value),
              'Volume',
            ]}
          />
          <Bar
            dataKey="averageVolume"
            name="Average Volume"
            fill="#8884d8"
            stackId="a"
          />
          <Bar
            dataKey="currentVolume"
            name="Current Volume"
            fill="#82ca9d"
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeChart;
