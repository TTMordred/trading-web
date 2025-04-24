import React from 'react';

interface SymbolSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const popularSymbols = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'AVAXUSDT',
];

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  selectedSymbol,
  onSymbolChange,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-center gap-2">
        {popularSymbols.map((symbol) => (
          <button
            key={symbol}
            onClick={() => onSymbolChange(symbol)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSymbol === symbol
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SymbolSelector;
