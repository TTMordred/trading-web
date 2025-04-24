export type TimeInterval = '15m' | '1h' | '4h' | '1d';

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  trades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignored: string;
}

export interface VolumeSpikeData {
  symbol: string;
  currentVolume: number;
  averageVolume: number;
  percentageIncrease: number;
  price: number;
  priceChange24h: number;
  timeframe?: string;
  candleTime?: number;
}

export interface RecentVolumeSpikeData extends VolumeSpikeData {
  spikeTime: number;
  peakPrice: number;
  lowPrice: number;
  currentPrice: number;
  fiboLevel?: number; // 0.5, 0.618, 0.786
  timeSinceSpike: string; // formatted time like "2h 30m"
  isAtFiboLevel: boolean;
}

export interface FibonacciLevel {
  level: number; // 0.5, 0.618, 0.786
  price: number;
}
