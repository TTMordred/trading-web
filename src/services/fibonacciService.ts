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
    // Calculate price at each Fibonacci level (from low to high)
    const price = low + (high - low) * level;
    return {
      level,
      price,
      reached: false
    };
  });
};

/**
 * Find the low price before a spike
 * This function identifies the lowest price point before the volume spike
 * to use as the starting point for Fibonacci retracement calculations
 */
export const findLowBeforeSpike = (klines: Kline[]): { low: number; timestamp: number } => {
  if (klines.length <= 1) {
    return { low: 0, timestamp: 0 };
  }

  // Get the candles before the current one (which is the spike)
  const currentCandle = klines[klines.length - 1];
  const historicalCandles = klines.slice(0, klines.length - 1);

  // Find the lowest low in the historical candles
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
 * Returns whether the price is at a Fibonacci level and which level it's closest to
 */
export const isPriceAtFibonacciLevel = (
  currentPrice: number,
  fibLevels: FibonacciLevel[]
): { isAt: boolean; nearestLevel?: number } => {
  if (fibLevels.length === 0 || currentPrice <= 0) {
    return { isAt: false };
  }

  // First check if we're exactly at any Fibonacci level
  for (const level of fibLevels) {
    const deviation = Math.abs(currentPrice - level.price) / level.price;
    if (deviation <= FIBONACCI_TOLERANCE) {
      return { isAt: true, nearestLevel: level.level };
    }
  }

  // If not at any level, find the closest one (but don't mark as "at" the level)
  let closestLevel = fibLevels[0];
  let minDeviation = Math.abs(currentPrice - closestLevel.price) / closestLevel.price;

  for (let i = 1; i < fibLevels.length; i++) {
    const level = fibLevels[i];
    const deviation = Math.abs(currentPrice - level.price) / level.price;

    if (deviation < minDeviation) {
      minDeviation = deviation;
      closestLevel = level;
    }
  }

  // Return false for isAt, but still provide the nearest level for reference
  return { isAt: false, nearestLevel: closestLevel.level };
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
 * This function takes a volume spike, finds the low before it,
 * calculates Fibonacci levels, and checks if the current price
 * is at a Fibonacci retracement level
 */
export const processSpikeWithFibonacci = async (
  symbol: string,
  spike: VolumeSpikeWithFibonacci,
  interval: string
): Promise<VolumeSpikeWithFibonacci> => {
  try {
    // Fetch more historical data to find the low before the spike
    const klines = await fetchKlineData(symbol, interval, 50);

    if (klines.length === 0) {
      throw new Error(`No kline data found for ${symbol}`);
    }

    // Find the low before the spike
    const { low, timestamp: lowTimestamp } = findLowBeforeSpike(klines);

    // Get the current candle (where the spike occurred)
    const currentCandle = klines[klines.length - 1];

    // Calculate Fibonacci levels
    const high = spike.price;
    // Use the actual candle time instead of current time
    const highTimestamp = currentCandle.closeTime;
    const fibLevels = calculateFibonacciLevels(high, low);

    // Check if current price is at a Fibonacci level
    const { isAt, nearestLevel } = isPriceAtFibonacciLevel(spike.price, fibLevels);

    // Calculate time since spike using the actual candle time
    const timeSinceSpike = Date.now() - highTimestamp;

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
      timeSinceSpike
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
 * Returns the top N volume spikes that are at Fibonacci retracement levels,
 * sorted by percentage increase
 */
export const getTopFibonacciOpportunities = (
  spikes: VolumeSpikeWithFibonacci[],
  limit: number = 5
): TopFibonacciOpportunity[] => {
  // Filter spikes that are at Fibonacci levels
  const spikesAtFibLevels = spikes.filter(spike =>
    spike.isAtFibonacciLevel && spike.nearestFibonacciLevel !== undefined
  );

  // Create a copy of the array before sorting to avoid mutating the original
  const sortedSpikes = [...spikesAtFibLevels];

  // Sort by percentage increase (most impressive spikes first)
  sortedSpikes.sort((a, b) => b.percentageIncrease - a.percentageIncrease);

  // Take the top N opportunities
  return sortedSpikes.slice(0, limit).map(spike => ({
    symbol: spike.symbol,
    percentageIncrease: spike.percentageIncrease,
    fibonacciLevel: spike.nearestFibonacciLevel!,
    price: spike.price,
    spikeTimestamp: spike.fibonacci?.highTimestamp ?? Date.now()
  }));
};
