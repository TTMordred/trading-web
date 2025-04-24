'use client';

import React, { useState } from 'react';

export type TimeScale = 
  // Minutes
  '1m' | '3m' | '5m' | '15m' | '30m' | 
  // Hours
  '1h' | '2h' | '4h' | '6h' | '12h' | 
  // Days
  '1d' | '3d' | 
  // Weeks
  '1w' | '2w' | 
  // Months
  '1M' | '3M' | '6M' | 
  // Year
  '1y';

interface TimeScaleSelectorProps {
  selectedTimeScale: TimeScale;
  onTimeScaleChange: (timeScale: TimeScale) => void;
}

const TimeScaleSelector: React.FC<TimeScaleSelectorProps> = ({
  selectedTimeScale,
  onTimeScaleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group time scales by category
  const timeScales = {
    minutes: [
      { value: '1m', label: '1m' },
      { value: '3m', label: '3m' },
      { value: '5m', label: '5m' },
      { value: '15m', label: '15m' },
      { value: '30m', label: '30m' },
    ],
    hours: [
      { value: '1h', label: '1h' },
      { value: '2h', label: '2h' },
      { value: '4h', label: '4h' },
      { value: '6h', label: '6h' },
      { value: '12h', label: '12h' },
    ],
    days: [
      { value: '1d', label: '1d' },
      { value: '3d', label: '3d' },
    ],
    weeks: [
      { value: '1w', label: '1w' },
      { value: '2w', label: '2w' },
    ],
    months: [
      { value: '1M', label: '1M' },
      { value: '3M', label: '3M' },
      { value: '6M', label: '6M' },
    ],
    years: [
      { value: '1y', label: '1y' },
    ],
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleTimeScaleSelect = (timeScale: TimeScale) => {
    onTimeScaleChange(timeScale);
    closeDropdown();
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          id="time-scale-menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={toggleDropdown}
        >
          {selectedTimeScale}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10" 
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby="time-scale-menu"
        >
          <div className="py-1" role="none">
            {Object.entries(timeScales).map(([category, scales]) => (
              <div key={category} className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{category}</h3>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {scales.map((scale) => (
                    <button
                      key={scale.value}
                      className={`px-2 py-1 text-sm rounded-md ${
                        selectedTimeScale === scale.value
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleTimeScaleSelect(scale.value as TimeScale)}
                      role="menuitem"
                    >
                      {scale.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeScaleSelector;
