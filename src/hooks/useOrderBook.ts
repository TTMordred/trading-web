import { useState, useEffect } from 'react';
import { OrderBook, OrderWall } from '@/types/orderbook';
import { fetchOrderBook, detectOrderWalls } from '@/services/orderBookService';
import { TimeScale } from '@/components/TimeScaleSelector';

export const useOrderBook = (symbol: string, timeScale: TimeScale = '15m') => {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [orderWalls, setOrderWalls] = useState<OrderWall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrderBook = async () => {
      setLoading(true);
      setError(null);

      try {
        // Note: Currently the Binance API doesn't support different time scales for order book directly,
        // but we're adding the parameter for future extensibility and UI consistency
        const data = await fetchOrderBook(symbol);
        if (isMounted) {
          setOrderBook(data);
          const walls = detectOrderWalls(data);
          setOrderWalls(walls);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch order book data. Please try again later.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrderBook();

    // Set up interval to refresh data every 10 seconds
    const intervalId = setInterval(loadOrderBook, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [symbol, timeScale]);

  return { orderBook, orderWalls, loading, error };
};
