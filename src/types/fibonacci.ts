import { VolumeSpikeData } from './binance';

export interface FibonacciLevel {
  level: number;
  price: number;
  reached: boolean;
  timestamp?: number; // When the price reached this level
}

export interface FibonacciRetracement {
  high: number;
  low: number;
  highTimestamp: number;
  levels: FibonacciLevel[];
}

export interface VolumeSpikeWithFibonacci extends VolumeSpikeData {
  fibonacci?: FibonacciRetracement;
  isAtFibonacciLevel: boolean;
  nearestFibonacciLevel?: number; // 0.5, 0.618, 0.786
  timeSinceSpike: number; // in milliseconds
}

export interface TopFibonacciOpportunity {
  symbol: string;
  percentageIncrease: number; // Original volume spike percentage
  fibonacciLevel: number; // Current Fibonacci level (0.5, 0.618, 0.786)
  price: number; // Current price
  spikeTimestamp: number; // When the spike occurred
}
