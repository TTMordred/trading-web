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
  const getSelectionStyle = (isSelected: boolean) =>
    isSelected
      ? 'bg-primary text-white border-primary'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700';

  const getCornerStyle = (value: TimeInterval) => {
    if (value === '15m') return 'rounded-l-lg';
    if (value === '1d') return 'rounded-r-lg';
    return '';
  };

  return (
    <div className="flex justify-center mb-6">
      <fieldset className="inline-flex rounded-md shadow-sm">
        <legend className="sr-only">Time interval selection</legend>
        {intervals.map((interval) => (
          <button
            key={interval.value}
            type="button"
            className={`px-4 py-2 text-sm font-medium border ${getSelectionStyle(selectedInterval === interval.value)} ${getCornerStyle(interval.value)}`}
            onClick={() => onIntervalChange(interval.value)}
          >
            {interval.label}
          </button>
        ))}
      </fieldset>
    </div>
  );
};

export default TimeIntervalSelector;
