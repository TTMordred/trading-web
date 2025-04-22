import { TimeInterval } from '@/types/binance';

const BINANCE_WS_BASE_URL = 'wss://stream.binance.com:9443/ws';

// Map the time intervals to Binance API intervals
const intervalMap: Record<TimeInterval, string> = {
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

/**
 * Create a WebSocket connection for a specific symbol and interval
 */
export const createKlineWebSocket = (
  symbol: string,
  interval: TimeInterval,
  onMessage: (data: any) => void
): WebSocket => {
  const ws = new WebSocket(`${BINANCE_WS_BASE_URL}/${symbol.toLowerCase()}@kline_${intervalMap[interval]}`);
  
  ws.onopen = () => {
    console.log(`WebSocket connection opened for ${symbol} at ${interval}`);
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error(`WebSocket error for ${symbol}:`, error);
  };
  
  ws.onclose = () => {
    console.log(`WebSocket connection closed for ${symbol}`);
  };
  
  return ws;
};

/**
 * Create a combined WebSocket stream for multiple symbols
 */
export const createCombinedStream = (
  symbols: string[],
  interval: TimeInterval,
  onMessage: (data: any) => void
): WebSocket => {
  const streams = symbols.map(symbol => `${symbol.toLowerCase()}@kline_${intervalMap[interval]}`);
  const ws = new WebSocket(`${BINANCE_WS_BASE_URL}/stream?streams=${streams.join('/')}`);
  
  ws.onopen = () => {
    console.log(`Combined WebSocket stream opened for ${symbols.length} symbols`);
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('Combined WebSocket stream closed');
  };
  
  return ws;
};
