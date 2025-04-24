export type TimeInterval = '15m' | '1h' | '4h' | '1d';
export type SignalType = 'BUY' | 'SELL' | 'NEUTRAL';
export type TrendDirection = 'UP' | 'DOWN' | 'NEUTRAL';

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
  signalType: SignalType; // BUY, SELL, or NEUTRAL
  trendDirection: TrendDirection; // UP, DOWN, or NEUTRAL
  signalStrength?: number; // 0-100 scale indicating signal strength
  priceToFiboRatio?: number; // How close price is to the exact fibo level (0-1)
}

export interface FibonacciLevel {
  level: number; // 0.5, 0.618, 0.786
  price: number;
}
