import { useState, useEffect } from 'react';
import { TimeInterval, VolumeSpikeData } from '@/types/binance';
import { VolumeSpikeWithFibonacci, TopFibonacciOpportunity } from '@/types/fibonacci';
import { 
  processSpikeWithFibonacci, 
  filterRecentSpikesAtFibonacciLevels,
  getTopFibonacciOpportunities
} from '@/services/fibonacciService';
import { fetchVolumeSpikes } from '@/services/binanceService';

export const useFibonacciRetracements = (interval: TimeInterval) => {
  const [volumeSpikesNow, setVolumeSpikesNow] = useState<VolumeSpikeData[]>([]);
  const [recentSpikes, setRecentSpikes] = useState<VolumeSpikeWithFibonacci[]>([]);
  const [topOpportunities, setTopOpportunities] = useState<TopFibonacciOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch current volume spikes
        const spikes = await fetchVolumeSpikes(interval);
        
        if (isMounted) {
          setVolumeSpikesNow(spikes);
          
          // Process each spike to add Fibonacci data
          const processedSpikesPromises = spikes.map(spike => 
            processSpikeWithFibonacci(
              spike.symbol, 
              { ...spike, isAtFibonacciLevel: false, timeSinceSpike: 0 }, 
              interval
            )
          );
          
          const processedSpikes = await Promise.all(processedSpikesPromises);
          
          // Filter recent spikes at Fibonacci levels
          const recentFibSpikes = filterRecentSpikesAtFibonacciLevels(processedSpikes);
          setRecentSpikes(recentFibSpikes);
          
          // Get top Fibonacci opportunities
          const topFibOpportunities = getTopFibonacciOpportunities(processedSpikes);
          setTopOpportunities(topFibOpportunities);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch Fibonacci retracement data. Please try again later.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Set up interval to refresh data every minute
    const intervalId = setInterval(loadData, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [interval]);

  return { 
    volumeSpikesNow, 
    recentSpikes, 
    topOpportunities, 
    loading, 
    error 
  };
};
