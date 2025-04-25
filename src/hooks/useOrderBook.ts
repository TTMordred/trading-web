import { useState, useEffect } from 'react';
import { OrderBook, OrderWall } from '@/types/orderbook';
import { fetchOrderBook, detectOrderWalls } from '@/services/orderBookService';
export const useOrderBook = (symbol: string) => {
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
        // Fetch the order book data for the selected symbol
        // The UI will handle price range scaling for visualization
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

    // Set up interval to refresh data every 15 minutes
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
    const intervalId = setInterval(loadOrderBook, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [symbol]);

  return { orderBook, orderWalls, loading, error };
};
