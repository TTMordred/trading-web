import { FibonacciData, FibonacciLevel, Kline } from '@/types/binance';

// Fibonacci retracement levels
export const FIBONACCI_LEVELS: FibonacciLevel[] = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];

// Priority Fibonacci levels for trading opportunities
export const PRIORITY_FIBONACCI_LEVELS: FibonacciLevel[] = [0.618, 0.786];

/**
 * Calculate Fibonacci retracement levels from high and low prices
 */
export const calculateFibonacciLevels = (
  highPrice: number,
  lowPrice: number
): Record<FibonacciLevel, number> => {
  const priceDifference = highPrice - lowPrice;
  
  return {
    0.236: highPrice - priceDifference * 0.236,
    0.382: highPrice - priceDifference * 0.382,
    0.5: highPrice - priceDifference * 0.5,
    0.618: highPrice - priceDifference * 0.618,
    0.786: highPrice - priceDifference * 0.786,
    1.0: lowPrice,
  };
};

/**
 * Find the nearest Fibonacci level to the current price
 */
export const findNearestFibonacciLevel = (
  highPrice: number,
  lowPrice: number,
  currentPrice: number,
  tolerance: number = 0.03 // 3% tolerance by default
): FibonacciLevel | undefined => {
  const levels = calculateFibonacciLevels(highPrice, lowPrice);
  const priceDifference = highPrice - lowPrice;
  const toleranceValue = priceDifference * tolerance;
  
  // Find the closest level
  let closestLevel: FibonacciLevel | undefined;
  let minDistance = Number.MAX_VALUE;
  
  for (const level of FIBONACCI_LEVELS) {
    const levelPrice = levels[level];
    const distance = Math.abs(currentPrice - levelPrice);
    
    if (distance < minDistance && distance <= toleranceValue) {
      minDistance = distance;
      closestLevel = level;
    }
  }
  
  return closestLevel;
};

/**
 * Calculate retracement percentage from high to current price
 */
export const calculateRetracementPercent = (
  highPrice: number,
  lowPrice: number,
  currentPrice: number
): number => {
  const priceDifference = highPrice - lowPrice;
  if (priceDifference === 0) return 0;
  
  const retracement = (highPrice - currentPrice) / priceDifference;
  return retracement * 100;
};

/**
 * Find high and low prices from historical klines
 */
export const findHighLowPrices = (klines: Kline[]): { highPrice: number; lowPrice: number } => {
  let highPrice = -Infinity;
  let lowPrice = Infinity;
  
  klines.forEach((kline) => {
    const high = parseFloat(kline.high);
    const low = parseFloat(kline.low);
    
    if (high > highPrice) {
      highPrice = high;
    }
    
    if (low < lowPrice) {
      lowPrice = low;
    }
  });
  
  return { highPrice, lowPrice };
};

/**
 * Calculate Fibonacci data for a given set of klines and current price
 */
export const calculateFibonacciData = (
  klines: Kline[],
  currentPrice: number
): FibonacciData | undefined => {
  if (klines.length < 2) return undefined;
  
  const { highPrice, lowPrice } = findHighLowPrices(klines);
  
  // If the price range is too small, don't calculate Fibonacci levels
  if (highPrice - lowPrice < highPrice * 0.01) return undefined;
  
  const nearestLevel = findNearestFibonacciLevel(highPrice, lowPrice, currentPrice);
  const retracementPercent = calculateRetracementPercent(highPrice, lowPrice, currentPrice);
  
  return {
    highPrice,
    lowPrice,
    currentPrice,
    nearestLevel,
    retracementPercent,
    spikeTime: klines[klines.length - 1].closeTime,
  };
};

/**
 * Check if a price is near a priority Fibonacci level
 */
export const isNearPriorityFibonacciLevel = (fibData?: FibonacciData): boolean => {
  if (!fibData || !fibData.nearestLevel) return false;
  return PRIORITY_FIBONACCI_LEVELS.includes(fibData.nearestLevel);
};
