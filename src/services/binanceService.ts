import axios from 'axios';
import { TimeInterval, VolumeSpikeData, Kline, FibonacciData } from '@/types/binance';
import { calculateFibonacciData, isNearPriorityFibonacciLevel } from '@/utils/fibonacci';

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

// Number of candles to fetch for Fibonacci calculations
const FIBONACCI_CANDLES = 100;

// Time window for recent volume spikes (in milliseconds)
const RECENT_SPIKE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

// Threshold for considering a volume spike as "cooled down"
const COOLDOWN_THRESHOLD = 0.5; // 50% of the spike volume

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
    // Fetch kline data for volume spike detection
    const klines = await fetchKlineData(symbol, interval);

    if (klines.length < HISTORY_CANDLES + 1) {
      return null;
    }

    // Current candle is the most recent one
    const currentCandle = klines[klines.length - 1];
    const currentVolume = parseFloat(currentCandle.volume);
    const currentPrice = parseFloat(currentCandle.close);

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

      // Fetch more historical data for Fibonacci calculations
      const fibKlines = await fetchKlineData(symbol, interval, FIBONACCI_CANDLES);
      const fibData = calculateFibonacciData(fibKlines, currentPrice);

      return {
        symbol,
        currentVolume,
        averageVolume,
        percentageIncrease: (currentVolume / averageVolume - 1) * 100,
        price: currentPrice,
        priceChange24h: parseFloat(tickerData.priceChangePercent),
        fibonacci: fibData,
        timestamp: Date.now(),
        cooledDown: false,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error detecting volume spike for ${symbol}:`, error);
    return null;
  }
};

// Fetch volume spikes for all trading pairs
export const fetchVolumeSpikes = async (interval: TimeInterval): Promise<VolumeSpikeData[]> => {
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

    return volumeSpikes;
  } catch (error) {
    console.error('Error fetching volume spikes:', error);
    throw error;
  }
};

/**
 * Check if a volume spike has cooled down by comparing current volume to spike volume
 */
export const checkVolumeSpikeStatus = async (
  spike: VolumeSpikeData,
  interval: TimeInterval
): Promise<VolumeSpikeData> => {
  try {
    // Fetch current kline data
    const klines = await fetchKlineData(spike.symbol, interval, 1);
    if (klines.length === 0) return spike;

    const currentCandle = klines[0];
    const currentVolume = parseFloat(currentCandle.volume);
    const currentPrice = parseFloat(currentCandle.close);

    // Update the spike with current information
    const updatedSpike = {
      ...spike,
      price: currentPrice,
      cooledDown: currentVolume <= spike.currentVolume * COOLDOWN_THRESHOLD,
    };

    // Update Fibonacci data if it exists
    if (spike.fibonacci) {
      const fibKlines = await fetchKlineData(spike.symbol, interval, FIBONACCI_CANDLES);
      const updatedFibData = calculateFibonacciData(fibKlines, currentPrice);

      if (updatedFibData) {
        updatedSpike.fibonacci = updatedFibData;
      }
    }

    return updatedSpike;
  } catch (error) {
    console.error(`Error checking volume spike status for ${spike.symbol}:`, error);
    return spike;
  }
};

/**
 * Fetch recent volume spikes that have cooled down
 */
export const fetchRecentVolumeSpikes = async (
  interval: TimeInterval
): Promise<VolumeSpikeData[]> => {
  try {
    // Fetch all current volume spikes
    const currentSpikes = await fetchVolumeSpikes(interval);

    // Filter spikes that are within the recent window
    const now = Date.now();
    const recentSpikes = currentSpikes.filter(
      spike => spike.timestamp && now - spike.timestamp <= RECENT_SPIKE_WINDOW
    );

    // Check if each spike has cooled down
    const updatedSpikesPromises = recentSpikes.map(spike =>
      checkVolumeSpikeStatus(spike, interval)
    );
    const updatedSpikes = await Promise.all(updatedSpikesPromises);

    // Filter for cooled down spikes
    const cooledDownSpikes = updatedSpikes
      .filter(spike => spike.cooledDown)
      .sort((a, b) => b.percentageIncrease - a.percentageIncrease);

    return cooledDownSpikes;
  } catch (error) {
    console.error('Error fetching recent volume spikes:', error);
    throw error;
  }
};

/**
 * Fetch top Fibonacci opportunities (volume spikes near priority Fibonacci levels)
 */
export const fetchFibonacciOpportunities = async (
  interval: TimeInterval
): Promise<VolumeSpikeData[]> => {
  try {
    // Fetch all current and recent volume spikes
    const currentSpikes = await fetchVolumeSpikes(interval);
    const recentSpikes = await fetchRecentVolumeSpikes(interval);

    // Combine and filter for spikes with Fibonacci data
    const allSpikes = [...currentSpikes, ...recentSpikes]
      .filter(spike => spike.fibonacci);

    // Filter for spikes near priority Fibonacci levels
    const fibonacciOpportunities = allSpikes
      .filter(spike => spike.fibonacci && isNearPriorityFibonacciLevel(spike.fibonacci))
      .sort((a, b) => {
        // Sort by Fibonacci level priority (0.618 and 0.786 are highest)
        const levelA = a.fibonacci?.nearestLevel || 0;
        const levelB = b.fibonacci?.nearestLevel || 0;

        // Prioritize 0.618 and 0.786 levels
        if (levelA === 0.618 && levelB !== 0.618) return -1;
        if (levelB === 0.618 && levelA !== 0.618) return 1;
        if (levelA === 0.786 && levelB !== 0.786) return -1;
        if (levelB === 0.786 && levelA !== 0.786) return 1;

        // Then sort by percentage increase
        return b.percentageIncrease - a.percentageIncrease;
      });

    return fibonacciOpportunities.slice(0, 5); // Return top 5
  } catch (error) {
    console.error('Error fetching Fibonacci opportunities:', error);
    throw error;
  }
};
