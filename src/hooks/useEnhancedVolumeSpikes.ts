import { useState, useEffect } from 'react';
import { TimeInterval, VolumeSpikeData } from '@/types/binance';
import { 
  fetchVolumeSpikes, 
  fetchRecentVolumeSpikes, 
  fetchFibonacciOpportunities 
} from '@/services/binanceService';

interface EnhancedVolumeSpikesResult {
  currentSpikes: VolumeSpikeData[];
  recentSpikes: VolumeSpikeData[];
  fibonacciOpportunities: VolumeSpikeData[];
  loading: boolean;
  error: string | null;
}

export const useEnhancedVolumeSpikes = (interval: TimeInterval): EnhancedVolumeSpikesResult => {
  const [currentSpikes, setCurrentSpikes] = useState<VolumeSpikeData[]>([]);
  const [recentSpikes, setRecentSpikes] = useState<VolumeSpikeData[]>([]);
  const [fibonacciOpportunities, setFibonacciOpportunities] = useState<VolumeSpikeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadAllVolumeSpikes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all three types of data in parallel
        const [current, recent, fibonacci] = await Promise.all([
          fetchVolumeSpikes(interval),
          fetchRecentVolumeSpikes(interval),
          fetchFibonacciOpportunities(interval),
        ]);
        
        if (isMounted) {
          setCurrentSpikes(current);
          setRecentSpikes(recent);
          setFibonacciOpportunities(fibonacci);
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

    loadAllVolumeSpikes();

    // Set up interval to refresh data every minute
    const intervalId = setInterval(loadAllVolumeSpikes, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [interval]);

  return { 
    currentSpikes, 
    recentSpikes, 
    fibonacciOpportunities, 
    loading, 
    error 
  };
};
