import axios from 'axios';
import { OrderBook, OrderBookEntry, OrderWall } from '@/types/orderbook';
import { VolumeZone } from '@/components/VolumeConcentrationZones';

const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

// Threshold for order wall (e.g., 50000 USDT)
const ORDER_WALL_THRESHOLD = 50000;

/**
 * Fetch order book data from Binance API
 */
export const fetchOrderBook = async (symbol: string, limit: number = 1000): Promise<OrderBook> => {
  try {
    const response = await axios.get(`${BINANCE_API_BASE_URL}/depth`, {
      params: {
        symbol,
        limit,
      },
    });

    // Parse the response data
    const orderBook: OrderBook = {
      lastUpdateId: response.data.lastUpdateId,
      bids: response.data.bids.map((bid: string[]) => ({
        price: parseFloat(bid[0]),
        quantity: parseFloat(bid[1]),
      })),
      asks: response.data.asks.map((ask: string[]) => ({
        price: parseFloat(ask[0]),
        quantity: parseFloat(ask[1]),
      })),
    };

    return orderBook;
  } catch (error) {
    console.error(`Error fetching order book for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Calculate the USDT value of an order
 */
const calculateOrderValue = (price: number, quantity: number): number => {
  return price * quantity;
};

/**
 * Detect order walls in the order book
 */
export const detectOrderWalls = (orderBook: OrderBook, threshold: number = ORDER_WALL_THRESHOLD): OrderWall[] => {
  const orderWalls: OrderWall[] = [];

  // Check for bid walls (buy orders)
  orderBook.bids.forEach((bid) => {
    const orderValue = calculateOrderValue(bid.price, bid.quantity);
    if (orderValue >= threshold) {
      orderWalls.push({
        price: bid.price,
        quantity: bid.quantity,
        type: 'bid',
      });
    }
  });

  // Check for ask walls (sell orders)
  orderBook.asks.forEach((ask) => {
    const orderValue = calculateOrderValue(ask.price, ask.quantity);
    if (orderValue >= threshold) {
      orderWalls.push({
        price: ask.price,
        quantity: ask.quantity,
        type: 'ask',
      });
    }
  });

  return orderWalls;
};

/**
 * Calculate cumulative bids and asks for heatmap
 */
export const calculateCumulativeOrders = (orderBook: OrderBook): { cumulativeBids: OrderBookEntry[], cumulativeAsks: OrderBookEntry[] } => {
  let cumulativeBidVolume = 0;
  let cumulativeAskVolume = 0;

  const cumulativeBids = orderBook.bids.map((bid) => {
    cumulativeBidVolume += bid.quantity;
    return {
      price: bid.price,
      quantity: cumulativeBidVolume,
    };
  });

  const cumulativeAsks = orderBook.asks.map((ask) => {
    cumulativeAskVolume += ask.quantity;
    return {
      price: ask.price,
      quantity: cumulativeAskVolume,
    };
  });

  return { cumulativeBids, cumulativeAsks };
};

/**
 * Calculate volume concentration zones
 * This identifies price ranges with significant order volume
 */
export const calculateVolumeConcentrationZones = (orderBook: OrderBook, zoneCount: number = 5): VolumeZone[] => {
  if (!orderBook?.bids?.length || !orderBook?.asks?.length) {
    return [];
  }

  const zones: VolumeZone[] = [];
  const VOLUME_THRESHOLD = 100000; // Minimum volume to consider a zone significant (in USDT)

  // Group bids by price ranges
  const bidRanges: Record<string, number> = {};
  const askRanges: Record<string, number> = {};

  // Find min and max prices
  const allPrices = [...orderBook.bids, ...orderBook.asks].map(entry => entry.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  // Calculate price range size (divide the full range into segments)
  const rangeSize = (maxPrice - minPrice) / 20; // 20 segments

  // Group bids by price ranges
  orderBook.bids.forEach(bid => {
    const rangeStart = Math.floor(bid.price / rangeSize) * rangeSize;
    const rangeEnd = rangeStart + rangeSize;
    const rangeKey = `${rangeStart.toFixed(2)}-${rangeEnd.toFixed(2)}`;

    const volume = bid.price * bid.quantity;
    bidRanges[rangeKey] = (bidRanges[rangeKey] || 0) + volume;
  });

  // Group asks by price ranges
  orderBook.asks.forEach(ask => {
    const rangeStart = Math.floor(ask.price / rangeSize) * rangeSize;
    const rangeEnd = rangeStart + rangeSize;
    const rangeKey = `${rangeStart.toFixed(2)}-${rangeEnd.toFixed(2)}`;

    const volume = ask.price * ask.quantity;
    askRanges[rangeKey] = (askRanges[rangeKey] || 0) + volume;
  });

  // Convert bid ranges to zones
  Object.entries(bidRanges)
    .filter(([, volume]) => volume > VOLUME_THRESHOLD)
    .sort((a, b) => b[1] - a[1]) // Sort by volume descending
    .slice(0, zoneCount) // Take top zones
    .forEach(([priceRange, volume]) => {
      zones.push({
        priceRange,
        volume,
        type: 'bid'
      });
    });

  // Convert ask ranges to zones
  Object.entries(askRanges)
    .filter(([, volume]) => volume > VOLUME_THRESHOLD)
    .sort((a, b) => b[1] - a[1]) // Sort by volume descending
    .slice(0, zoneCount) // Take top zones
    .forEach(([priceRange, volume]) => {
      zones.push({
        priceRange,
        volume,
        type: 'ask'
      });
    });

  return zones;
};
