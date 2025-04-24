import { Kline } from '@/types/binance';
import { FibonacciLevel, FibonacciRetracement, VolumeSpikeWithFibonacci, TopFibonacciOpportunity } from '@/types/fibonacci';
import { fetchKlineData } from './binanceService';

// Fibonacci retracement levels we're interested in
export const FIBONACCI_LEVELS = [0.5, 0.618, 0.786];

// Tolerance for price to be considered "at" a Fibonacci level (±1%)
export const FIBONACCI_TOLERANCE = 0.01;

// Maximum time to consider a spike "recent" (24 hours in milliseconds)
export const RECENT_SPIKE_MAX_TIME = 24 * 60 * 60 * 1000;

/**
 * Calculate Fibonacci retracement levels from high to low
 */
export const calculateFibonacciLevels = (high: number, low: number): FibonacciLevel[] => {
  return FIBONACCI_LEVELS.map(level => {
    const price = low + (high - low) * (1 - level);
    return {
      level,
      price,
      reached: false
    };
  });
};

/**
 * Find the low price before a spike
 */
export const findLowBeforeSpike = (klines: Kline[]): { low: number; timestamp: number } => {
  // Get the 20 candles before the spike
  const historicalCandles = klines.slice(0, klines.length - 1);
  
  // Find the lowest low
  let lowestLow = Number.MAX_VALUE;
  let lowestLowTimestamp = 0;
  
  historicalCandles.forEach(candle => {
    const low = parseFloat(candle.low);
    if (low < lowestLow) {
      lowestLow = low;
      lowestLowTimestamp = candle.openTime;
    }
  });
  
  return { low: lowestLow, timestamp: lowestLowTimestamp };
};

/**
 * Check if the current price is at or near a Fibonacci level
 */
export const isPriceAtFibonacciLevel = (
  currentPrice: number,
  fibLevels: FibonacciLevel[]
): { isAt: boolean; nearestLevel?: number } => {
  for (const level of fibLevels) {
    const deviation = Math.abs(currentPrice - level.price) / level.price;
    if (deviation <= FIBONACCI_TOLERANCE) {
      return { isAt: true, nearestLevel: level.level };
    }
  }
  
  return { isAt: false };
};

/**
 * Update Fibonacci levels with current price data
 */
export const updateFibonacciLevels = (
  levels: FibonacciLevel[],
  currentPrice: number,
  timestamp: number
): FibonacciLevel[] => {
  return levels.map(level => {
    const deviation = Math.abs(currentPrice - level.price) / level.price;
    const isAtLevel = deviation <= FIBONACCI_TOLERANCE;
    
    // If we're at this level and it hasn't been reached before, mark it as reached
    if (isAtLevel && !level.reached) {
      return { ...level, reached: true, timestamp };
    }
    
    return level;
  });
};

/**
 * Process volume spikes to add Fibonacci retracement data
 */
export const processSpikeWithFibonacci = async (
  symbol: string,
  spike: VolumeSpikeWithFibonacci,
  interval: string
): Promise<VolumeSpikeWithFibonacci> => {
  try {
    // Fetch more historical data to find the low before the spike
    const klines = await fetchKlineData(symbol, interval, 50);
    
    // Find the low before the spike
    const { low, timestamp: lowTimestamp } = findLowBeforeSpike(klines);
    
    // Calculate Fibonacci levels
    const high = spike.price;
    const highTimestamp = Date.now(); // Current time as an approximation
    const fibLevels = calculateFibonacciLevels(high, low);
    
    // Check if current price is at a Fibonacci level
    const { isAt, nearestLevel } = isPriceAtFibonacciLevel(spike.price, fibLevels);
    
    return {
      ...spike,
      fibonacci: {
        high,
        low,
        highTimestamp,
        levels: fibLevels
      },
      isAtFibonacciLevel: isAt,
      nearestFibonacciLevel: nearestLevel,
      timeSinceSpike: Date.now() - highTimestamp
    };
  } catch (error) {
    console.error(`Error processing Fibonacci data for ${symbol}:`, error);
    return {
      ...spike,
      isAtFibonacciLevel: false,
      timeSinceSpike: 0
    };
  }
};

/**
 * Filter volume spikes that have retraced to Fibonacci levels
 */
export const filterRecentSpikesAtFibonacciLevels = (
  spikes: VolumeSpikeWithFibonacci[]
): VolumeSpikeWithFibonacci[] => {
  return spikes.filter(spike => 
    spike.isAtFibonacciLevel && 
    spike.timeSinceSpike <= RECENT_SPIKE_MAX_TIME
  );
};

/**
 * Get top Fibonacci opportunities (impressive volume spikes at key Fibonacci levels)
 */
export const getTopFibonacciOpportunities = (
  spikes: VolumeSpikeWithFibonacci[],
  limit: number = 5
): TopFibonacciOpportunity[] => {
  // Filter spikes that are at Fibonacci levels
  const spikesAtFibLevels = spikes.filter(spike => spike.isAtFibonacciLevel && spike.nearestFibonacciLevel);
  
  // Sort by percentage increase (most impressive spikes first)
  const sortedSpikes = spikesAtFibLevels.sort((a, b) => b.percentageIncrease - a.percentageIncrease);
  
  // Take the top N opportunities
  return sortedSpikes.slice(0, limit).map(spike => ({
    symbol: spike.symbol,
    percentageIncrease: spike.percentageIncrease,
    fibonacciLevel: spike.nearestFibonacciLevel!,
    price: spike.price,
    spikeTimestamp: spike.fibonacci?.highTimestamp || Date.now()
  }));
};
