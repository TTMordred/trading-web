import axios from 'axios';
import { TimeInterval, VolumeSpikeData, Kline, RecentVolumeSpikeData, FibonacciLevel } from '@/types/binance';

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
  return FIBONACCI_LEVELS.map(level => ({
    level,
    price: lowPrice + (highPrice - lowPrice) * level
  }));
};

// Check if a price is at a Fibonacci level
export const isPriceAtFibonacciLevel = (
  price: number,
  fibLevels: FibonacciLevel[]
): { isAtLevel: boolean; level?: number } => {
  for (const fib of fibLevels) {
    const tolerance = fib.price * FIBO_LEVEL_TOLERANCE;
    if (Math.abs(price - fib.price) <= tolerance) {
      return { isAtLevel: true, level: fib.level };
    }
  }
  return { isAtLevel: false };
};

// Format time since spike
export const formatTimeSinceSpike = (spikeTime: number): string => {
  const now = Date.now();
  const diffMs = now - spikeTime;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }
  return `${diffMinutes}m`;
};

// Store for recent volume spikes (in-memory cache)
// In a production app, this would be stored in a database
const recentVolumeSpikes: Map<string, RecentVolumeSpikeData> = new Map();

// Record a volume spike for tracking
export const recordVolumeSpike = (spike: VolumeSpikeData, highPrice: number, lowPrice: number): void => {
  const recentSpike: RecentVolumeSpikeData = {
    ...spike,
    spikeTime: Date.now(),
    peakPrice: highPrice,
    lowPrice: lowPrice,
    currentPrice: spike.price,
    timeSinceSpike: '0m',
    isAtFiboLevel: false
  };

  recentVolumeSpikes.set(spike.symbol, recentSpike);
};

// Update recent volume spikes with current prices and check Fibonacci levels
export const updateRecentVolumeSpikes = async (): Promise<RecentVolumeSpikeData[]> => {
  const updatedSpikes: RecentVolumeSpikeData[] = [];
  const currentTime = Date.now();

  for (const [symbol, spike] of recentVolumeSpikes.entries()) {
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

      // Check if price is at a Fibonacci level
      const { isAtLevel, level } = isPriceAtFibonacciLevel(currentPrice, fibLevels);

      // Update spike data
      const updatedSpike: RecentVolumeSpikeData = {
        ...spike,
        currentPrice,
        timeSinceSpike: formatTimeSinceSpike(spike.spikeTime),
        isAtFiboLevel: isAtLevel,
        fiboLevel: level
      };

      recentVolumeSpikes.set(symbol, updatedSpike);

      if (isAtLevel) {
        updatedSpikes.push(updatedSpike);
      }
    } catch (error) {
      console.error(`Error updating recent spike for ${symbol}:`, error);
    }
  }

  // Sort by percentage increase
  return updatedSpikes.sort((a, b) => b.percentageIncrease - a.percentageIncrease);
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
