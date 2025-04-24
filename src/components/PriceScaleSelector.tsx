'use client';

import React from 'react';

export type PriceScale = '1%' | '2%' | '5%' | '10%' | '20%' | '50%';

interface PriceScaleSelectorProps {
  selectedPriceScale: PriceScale;
  onPriceScaleChange: (scale: PriceScale) => void;
}

const PriceScaleSelector: React.FC<PriceScaleSelectorProps> = ({
  selectedPriceScale,
  onPriceScaleChange,
}) => {
  const scales: PriceScale[] = ['1%', '2%', '5%', '10%', '20%', '50%'];

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-400 mr-2">Price Range:</span>
        <div className="flex bg-gray-800 rounded-lg p-1">
          {scales.map((scale) => (
            <button
              key={scale}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPriceScale === scale
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => onPriceScaleChange(scale)}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1 ml-2">
        Price range: ±{selectedPriceScale} from current price (larger % = wider view)
      </div>
    </div>
  );
};

export default PriceScaleSelector;
