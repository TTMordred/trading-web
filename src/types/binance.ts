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
}
