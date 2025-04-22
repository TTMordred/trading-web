import axios from 'axios';
import { TimeInterval, VolumeSpikeData, Kline } from '@/types/binance';

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
