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
      <div className="inline-flex rounded-md shadow-sm" role="group">
        {intervals.map((interval) => (
          <button
            key={interval.value}
            type="button"
            className={`px-4 py-2 text-sm font-medium border ${
              selectedInterval === interval.value
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700'
            } ${
              interval.value === '15m'
                ? 'rounded-l-lg'
                : interval.value === '1d'
                ? 'rounded-r-lg'
                : ''
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
