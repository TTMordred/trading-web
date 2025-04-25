import { useState, useEffect } from 'react';
import { TimeInterval, VolumeSpikeData } from '@/types/binance';
import { fetchVolumeSpikes } from '@/services/binanceService';

export const useVolumeSpikes = (interval: TimeInterval) => {
  const [volumeSpikes, setVolumeSpikes] = useState<VolumeSpikeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadVolumeSpikes = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchVolumeSpikes(interval);
        if (isMounted) {
          setVolumeSpikes(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch volume spikes. Please try again later.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVolumeSpikes();

    // Set up interval to refresh data every 15 minutes
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
    const intervalId = setInterval(loadVolumeSpikes, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [interval]);

  return { volumeSpikes, loading, error };
};
