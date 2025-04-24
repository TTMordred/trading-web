import React from 'react';
import { TimeInterval } from '@/types/binance';

interface TimeIntervalSelectorProps {
  selectedInterval: TimeInterval;
  onIntervalChange: (interval: TimeInterval) => void;
}

const intervals: { value: TimeInterval; label: string }[] = [
  { value: '15m', label: 'M15' },
  { value: '1h', label: 'H1' },
  { value: '4h', label: 'H4' },
  { value: '1d', label: 'D1' },
];

const TimeIntervalSelector: React.FC<TimeIntervalSelectorProps> = ({
  selectedInterval,
  onIntervalChange,
}) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-gray-800/70 p-1 rounded-lg shadow-lg inline-flex">
        {intervals.map((interval) => (
          <button
            key={interval.value}
            type="button"
            className={`px-5 py-2 text-sm font-medium transition-all duration-200 ${
              selectedInterval === interval.value
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-md'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md'
            }`}
            onClick={() => onIntervalChange(interval.value)}
          >
            {interval.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeIntervalSelector;
