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

export type FibonacciLevel = 0.236 | 0.382 | 0.5 | 0.618 | 0.786 | 1.0;

export interface FibonacciData {
  highPrice: number;
  lowPrice: number;
  currentPrice: number;
  nearestLevel?: FibonacciLevel;
  retracementPercent?: number;
  spikeTime?: number; // Timestamp when the volume spike occurred
}

export interface VolumeSpikeData {
  symbol: string;
  currentVolume: number;
  averageVolume: number;
  percentageIncrease: number;
  price: number;
  priceChange24h: number;
  fibonacci?: FibonacciData;
  timestamp?: number; // When the spike was detected
  cooledDown?: boolean; // Whether the spike has cooled down
}
