import axios from 'axios';
import {
  TimeInterval,
  VolumeSpikeData,
  Kline,
  RecentVolumeSpikeData,
  FibonacciLevel,
  SignalType,
  TrendDirection
} from '@/types/binance';

const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

// Map the time intervals to Binance API intervals
const intervalMap: Record<TimeInterval, string> = {
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

// Number of candles to fetch for calculating average volume
const HISTORY_CANDLES = 20;

// Threshold for volume spike (e.g., 2 means current volume is 2x the average)
const VOLUME_SPIKE_THRESHOLD = 2;

// Fibonacci retracement levels we're interested in
const FIBONACCI_LEVELS = [0.5, 0.618, 0.786];

// Tolerance for price to be considered at a Fibonacci level (±1%)
const FIBO_LEVEL_TOLERANCE = 0.01;

// Maximum time to consider a spike "recent" (in hours)
const MAX_RECENT_SPIKE_HOURS = 24;

// Fetch all trading pairs from Binance
export const fetchTradingPairs = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${BINANCE_API_BASE_URL}/exchangeInfo`);
    const symbols = response.data.symbols
      .filter((symbol: any) => symbol.status === 'TRADING' && symbol.quoteAsset === 'USDT')
      .map((symbol: any) => symbol.symbol);
    return symbols;
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    throw error;
  }
};

// Parse Binance kline data
const parseKlineData = (data: any[]): Kline => {
  return {
    openTime: data[0],
    open: data[1],
    high: data[2],
    low: data[3],
    close: data[4],
    volume: data[5],
    closeTime: data[6],
    quoteAssetVolume: data[7],
    trades: data[8],
    takerBuyBaseAssetVolume: data[9],
    takerBuyQuoteAssetVolume: data[10],
    ignored: data[11],
  };
};

// Fetch kline data for a specific symbol and interval
export const fetchKlineData = async (
  symbol: string,
  interval: TimeInterval,
  limit: number = HISTORY_CANDLES + 1
): Promise<Kline[]> => {
  try {
    const response = await axios.get(`${BINANCE_API_BASE_URL}/klines`, {
      params: {
        symbol,
        interval: intervalMap[interval],
        limit,
      },
    });
    return response.data.map(parseKlineData);
  } catch (error) {
    console.error(`Error fetching kline data for ${symbol}:`, error);
    throw error;
  }
};

// Fetch 24h ticker data for a symbol
export const fetch24hTickerData = async (symbol: string) => {
  try {
    const response = await axios.get(`${BINANCE_API_BASE_URL}/ticker/24hr`, {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching 24h ticker data for ${symbol}:`, error);
    throw error;
  }
};

// Detect volume spikes for a given symbol
export const detectVolumeSpike = async (
  symbol: string,
  interval: TimeInterval
): Promise<VolumeSpikeData | null> => {
  try {
    // Fetch kline data
    const klines = await fetchKlineData(symbol, interval);

    if (klines.length < HISTORY_CANDLES + 1) {
      return null;
    }

    // Current candle is the most recent one
    const currentCandle = klines[klines.length - 1];
    const currentVolume = parseFloat(currentCandle.volume);

    // Calculate average volume from historical candles (excluding the current one)
    const historicalCandles = klines.slice(0, klines.length - 1);
    const totalHistoricalVolume = historicalCandles.reduce(
      (sum, candle) => sum + parseFloat(candle.volume),
      0
    );
    const averageVolume = totalHistoricalVolume / historicalCandles.length;

    // Check if current volume exceeds the threshold
    if (currentVolume >= averageVolume * VOLUME_SPIKE_THRESHOLD) {
      // Fetch 24h ticker data for additional information
      const tickerData = await fetch24hTickerData(symbol);

      return {
        symbol,
        currentVolume,
        averageVolume,
        percentageIncrease: (currentVolume / averageVolume - 1) * 100,
        price: parseFloat(currentCandle.close),
        priceChange24h: parseFloat(tickerData.priceChangePercent),
      };
    }

    return null;
  } catch (error) {
    console.error(`Error detecting volume spike for ${symbol}:`, error);
    return null;
  }
};

// Calculate Fibonacci retracement levels
export const calculateFibonacciLevels = (highPrice: number, lowPrice: number): FibonacciLevel[] => {
  // Ensure high and low prices are valid
  if (highPrice <= 0 || lowPrice <= 0 || highPrice <= lowPrice) {
    console.warn('Invalid high/low prices for Fibonacci calculation:', { highPrice, lowPrice });
    return [];
  }

  return FIBONACCI_LEVELS.map(level => ({
    level,
    price: lowPrice + (highPrice - lowPrice) * level
  }));
};

// Check if a price is at a Fibonacci level
export const isPriceAtFibonacciLevel = (
  price: number,
  fibLevels: FibonacciLevel[]
): { isAtLevel: boolean; level?: number; priceToFiboRatio?: number } => {
  if (fibLevels.length === 0 || price <= 0) {
    return { isAtLevel: false };
  }

  // First check if we're exactly at any Fibonacci level
  for (const fib of fibLevels) {
    const tolerance = fib.price * FIBO_LEVEL_TOLERANCE;
    if (Math.abs(price - fib.price) <= tolerance) {
      // Calculate how close the price is to the exact Fibonacci level (0-1 scale)
      // 0 means exactly at the level, 1 means at the edge of tolerance
      const priceToFiboRatio = Math.abs(price - fib.price) / tolerance;
      return { isAtLevel: true, level: fib.level, priceToFiboRatio };
    }
  }

  // If not at any level, find the closest one (but don't mark as "at" the level)
  let closestFib = fibLevels[0];
  let minDeviation = Math.abs(price - closestFib.price) / closestFib.price;

  for (let i = 1; i < fibLevels.length; i++) {
    const fib = fibLevels[i];
    const deviation = Math.abs(price - fib.price) / fib.price;

    if (deviation < minDeviation) {
      minDeviation = deviation;
      closestFib = fib;
    }
  }

  // Calculate how far we are from the closest level
  const tolerance = closestFib.price * FIBO_LEVEL_TOLERANCE;
  const priceToFiboRatio = Math.min(1, Math.abs(price - closestFib.price) / tolerance);

  // Return false for isAtLevel, but still provide the nearest level for reference
  return { isAtLevel: false, level: closestFib.level, priceToFiboRatio };
};

// Determine trend direction based on price movement
export const determineTrendDirection = (
  currentPrice: number,
  peakPrice: number,
  lowPrice: number
): TrendDirection => {
  // If current price is closer to peak than low, trend is UP
  if (Math.abs(currentPrice - peakPrice) < Math.abs(currentPrice - lowPrice)) {
    return 'UP';
  }
  // If current price is closer to low than peak, trend is DOWN
  else if (Math.abs(currentPrice - lowPrice) < Math.abs(currentPrice - peakPrice)) {
    return 'DOWN';
  }
  // If equidistant or can't determine
  return 'NEUTRAL';
};

// Determine signal type based on trend and Fibonacci level
export const determineSignalType = (
  trendDirection: TrendDirection,
  fiboLevel?: number
): SignalType => {
  if (!fiboLevel) return 'NEUTRAL';

  // For uptrend, we want to buy at deep retracements (0.618-0.786)
  if (trendDirection === 'UP') {
    if (fiboLevel >= 0.5 && fiboLevel <= 0.786) {
      return 'BUY';
    }
  }
  // For downtrend, we want to sell at shallow retracements (0.5-0.618)
  else if (trendDirection === 'DOWN') {
    if (fiboLevel >= 0.5 && fiboLevel <= 0.786) {
      return 'SELL';
    }
  }

  return 'NEUTRAL';
};

// Calculate signal strength based on Fibonacci level and price ratio
export const calculateSignalStrength = (
  fiboLevel?: number,
  priceToFiboRatio?: number
): number => {
  if (!fiboLevel || priceToFiboRatio === undefined) return 0;

  // Base strength on Fibonacci level (0.786 is strongest)
  let strength = 0;
  if (fiboLevel === 0.786) strength = 90;
  else if (fiboLevel === 0.618) strength = 80;
  else if (fiboLevel === 0.5) strength = 70;
  else strength = 50;

  // Adjust strength based on how close price is to exact Fibonacci level
  // priceToFiboRatio of 0 means exactly at level (strongest)
  // priceToFiboRatio of 1 means at edge of tolerance (weakest)
  strength = strength * (1 - priceToFiboRatio * 0.5);

  return Math.round(strength);
};

// Format time since spike
export const formatTimeSinceSpike = (spikeTime: number): string => {
  if (!spikeTime || spikeTime <= 0) {
    return 'N/A';
  }

  const now = Date.now();
  const diffMs = now - spikeTime;

  // Handle negative time difference (could happen if system clocks are not in sync)
  if (diffMs < 0) {
    return '0m';
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }

  // If less than a minute, show "Just now" instead of "0m"
  if (diffMinutes === 0) {
    return 'Just now';
  }

  return `${diffMinutes}m`;
};

// Store for recent volume spikes (in-memory cache)
// In a production app, this would be stored in a database
const recentVolumeSpikes: Map<string, RecentVolumeSpikeData> = new Map();

// Record a volume spike for tracking
export const recordVolumeSpike = (spike: VolumeSpikeData, highPrice: number, lowPrice: number): void => {
  // Determine initial trend direction
  const trendDirection = determineTrendDirection(spike.price, highPrice, lowPrice);

  const recentSpike: RecentVolumeSpikeData = {
    ...spike,
    spikeTime: Date.now(),
    peakPrice: highPrice,
    lowPrice: lowPrice,
    currentPrice: spike.price,
    timeSinceSpike: '0m',
    isAtFiboLevel: false,
    signalType: 'NEUTRAL', // Initial signal is neutral until we hit a Fibo level
    trendDirection, // Set initial trend direction
    signalStrength: 0 // Initial strength is 0
  };

  recentVolumeSpikes.set(spike.symbol, recentSpike);
};

// Update recent volume spikes with current prices and check Fibonacci levels
export const updateRecentVolumeSpikes = async (): Promise<RecentVolumeSpikeData[]> => {
  const updatedSpikes: RecentVolumeSpikeData[] = [];
  const currentTime = Date.now();

  // Convert Map entries to array to avoid iterator issues
  const spikes = Array.from(recentVolumeSpikes.entries());

  for (const [symbol, spike] of spikes) {
    // Skip if spike is older than MAX_RECENT_SPIKE_HOURS
    const ageHours = (currentTime - spike.spikeTime) / (1000 * 60 * 60);
    if (ageHours > MAX_RECENT_SPIKE_HOURS) {
      recentVolumeSpikes.delete(symbol);
      continue;
    }

    try {
      // Get current price
      const tickerData = await fetch24hTickerData(symbol);
      const currentPrice = parseFloat(tickerData.lastPrice);

      // Calculate Fibonacci levels
      const fibLevels = calculateFibonacciLevels(spike.peakPrice, spike.lowPrice);

      // Skip if we couldn't calculate Fibonacci levels (invalid prices)
      if (fibLevels.length === 0) {
        continue;
      }

      // Check if price is at a Fibonacci level
      const { isAtLevel, level, priceToFiboRatio } = isPriceAtFibonacciLevel(currentPrice, fibLevels);

      // Determine trend direction based on current price relative to peak and low
      const trendDirection = determineTrendDirection(currentPrice, spike.peakPrice, spike.lowPrice);

      // Determine signal type based on trend and Fibonacci level
      const signalType = isAtLevel ? determineSignalType(trendDirection, level) : 'NEUTRAL';

      // Calculate signal strength
      const signalStrength = isAtLevel ? calculateSignalStrength(level, priceToFiboRatio) : 0;

      // Format time since spike
      const timeSinceStr = formatTimeSinceSpike(spike.spikeTime);

      // Update spike data
      const updatedSpike: RecentVolumeSpikeData = {
        ...spike,
        currentPrice,
        timeSinceSpike: timeSinceStr,
        isAtFiboLevel: isAtLevel,
        fiboLevel: level,
        trendDirection,
        signalType,
        signalStrength,
        priceToFiboRatio
      };

      recentVolumeSpikes.set(symbol, updatedSpike);

      if (isAtLevel) {
        updatedSpikes.push(updatedSpike);
      }
    } catch (error) {
      console.error(`Error updating recent spike for ${symbol}:`, error);
    }
  }

  // Sort the spikes by multiple criteria
  // Create a copy of the array before sorting
  const sortedSpikes = [...updatedSpikes];

  // Create a helper function to get a numeric value for Fibonacci level preference
  const getFiboValue = (level?: number): number => {
    if (level === 0.786) return 3;
    if (level === 0.618) return 2;
    if (level === 0.5) return 1;
    return 0;
  };

  // Sort by multiple criteria
  sortedSpikes.sort((a, b) => {
    // First sort by signal strength
    const strengthDiff = (b.signalStrength ?? 0) - (a.signalStrength ?? 0);
    if (strengthDiff !== 0) return strengthDiff;

    // Then by Fibonacci level preference
    const aFiboValue = getFiboValue(a.fiboLevel);
    const bFiboValue = getFiboValue(b.fiboLevel);
    if (aFiboValue !== bFiboValue) return bFiboValue - aFiboValue;

    // Finally by percentage increase
    return b.percentageIncrease - a.percentageIncrease;
  });

  return sortedSpikes;
};

// Fetch current volume spikes (happening now)
export const fetchCurrentVolumeSpikes = async (interval: TimeInterval): Promise<VolumeSpikeData[]> => {
  try {
    // Fetch all trading pairs
    const symbols = await fetchTradingPairs();

    // Detect volume spikes for each symbol
    const volumeSpikesPromises = symbols.map(symbol => detectVolumeSpike(symbol, interval));
    const volumeSpikesResults = await Promise.all(volumeSpikesPromises);

    // Filter out null results and sort by percentage increase
    const volumeSpikes = volumeSpikesResults
      .filter((result): result is VolumeSpikeData => result !== null)
      .sort((a, b) => b.percentageIncrease - a.percentageIncrease);

    // Record spikes for future tracking
    for (const spike of volumeSpikes) {
      try {
        // Get high and low prices for Fibonacci calculation
        const klines = await fetchKlineData(spike.symbol, interval, 5); // Get a few recent candles
        const highPrice = Math.max(...klines.map(k => parseFloat(k.high)));
        const lowPrice = Math.min(...klines.map(k => parseFloat(k.low)));

        recordVolumeSpike(spike, highPrice, lowPrice);
      } catch (error) {
        console.error(`Error recording spike for ${spike.symbol}:`, error);
      }
    }

    return volumeSpikes;
  } catch (error) {
    console.error('Error fetching volume spikes:', error);
    throw error;
  }
};

// Fetch volume spikes for all trading pairs (legacy function, now calls fetchCurrentVolumeSpikes)
export const fetchVolumeSpikes = async (interval: TimeInterval): Promise<VolumeSpikeData[]> => {
  return fetchCurrentVolumeSpikes(interval);
};
