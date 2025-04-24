import React from 'react';
import { FibonacciLevel } from '@/types/binance';

interface FibonacciVisualizerProps {
  fibLevels: FibonacciLevel[];
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  width?: number;
  height?: number;
}

const FibonacciVisualizer: React.FC<FibonacciVisualizerProps> = ({
  fibLevels,
  currentPrice,
  highPrice,
  lowPrice,
  width = 120,
  height = 40,
}) => {
  // Calculate price to y-coordinate mapping
  const priceToY = (price: number) => {
    const range = highPrice - lowPrice;
    return height - ((price - lowPrice) / range) * height;
  };

  // Calculate current price position
  const currentPriceY = priceToY(currentPrice);
  
  // Find the closest Fibonacci level to the current price
  const closestFibLevel = fibLevels.reduce((closest, current) => {
    return Math.abs(current.price - currentPrice) < Math.abs(closest.price - currentPrice)
      ? current
      : closest;
  }, fibLevels[0]);

  return (
    <svg width={width} height={height} className="inline-block">
      {/* Background */}
      <rect x="0" y="0" width={width} height={height} fill="#1f2937" rx="2" />
      
      {/* Fibonacci levels */}
      {fibLevels.map((level, index) => {
        const y = priceToY(level.price);
        const isClosest = level.level === closestFibLevel.level;
        
        // Choose color based on Fibonacci level
        let color = '#9ca3af'; // Default gray
        if (level.level === 0.5) color = '#3b82f6'; // Blue
        if (level.level === 0.618) color = '#10b981'; // Green
        if (level.level === 0.786) color = '#8b5cf6'; // Purple
        
        return (
          <React.Fragment key={index}>
            {/* Fibonacci line */}
            <line
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke={color}
              strokeWidth={isClosest ? 1.5 : 0.5}
              strokeDasharray={isClosest ? "none" : "2,2"}
            />
            
            {/* Fibonacci label */}
            <text
              x={width - 2}
              y={y - 2}
              fontSize="8"
              textAnchor="end"
              fill={color}
              fontWeight={isClosest ? "bold" : "normal"}
            >
              {level.level.toFixed(3)}
            </text>
          </React.Fragment>
        );
      })}
      
      {/* High and low price markers */}
      <line x1="0" y1="0" x2={width} y2="0" stroke="#ef4444" strokeWidth="1" />
      <line x1="0" y1={height} x2={width} y2={height} stroke="#10b981" strokeWidth="1" />
      
      {/* Current price marker */}
      <line
        x1="0"
        y1={currentPriceY}
        x2={width}
        y2={currentPriceY}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      
      {/* Current price indicator */}
      <circle cx={width / 2} cy={currentPriceY} r="3" fill="#ffffff" />
    </svg>
  );
};

export default FibonacciVisualizer;
