import { useState, useEffect } from 'react';
import { TimeInterval, VolumeSpikeData, RecentVolumeSpikeData } from '@/types/binance';
import { fetchCurrentVolumeSpikes, updateRecentVolumeSpikes } from '@/services/binanceService';

export const useEnhancedVolumeSpikes = (interval: TimeInterval) => {
  const [currentSpikes, setCurrentSpikes] = useState<VolumeSpikeData[]>([]);
  const [recentSpikes, setRecentSpikes] = useState<RecentVolumeSpikeData[]>([]);
  const [topOpportunities, setTopOpportunities] = useState<RecentVolumeSpikeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadVolumeSpikes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch current volume spikes
        const currentData = await fetchCurrentVolumeSpikes(interval);
        
        // Update recent spikes and check for Fibonacci levels
        const recentData = await updateRecentVolumeSpikes();
        
        if (isMounted) {
          setCurrentSpikes(currentData);
          
          // Filter recent spikes to only those at Fibonacci levels
          const fiboSpikes = recentData.filter(spike => spike.isAtFiboLevel);
          setRecentSpikes(fiboSpikes);
          
          // Get top 5 opportunities (highest percentage increase)
          setTopOpportunities(fiboSpikes.slice(0, 5));
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

    // Set up interval to refresh data every minute
    const intervalId = setInterval(loadVolumeSpikes, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [interval]);

  return { 
    currentSpikes, 
    recentSpikes, 
    topOpportunities, 
    loading, 
    error 
  };
};
