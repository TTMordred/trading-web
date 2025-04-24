import { useState, useEffect } from 'react';
import { TimeInterval, VolumeSpikeData, RecentVolumeSpikeData } from '@/types/binance';
import { fetchCurrentVolumeSpikes, updateRecentVolumeSpikes } from '@/services/binanceService';

// Helper function to get a numeric value for Fibonacci level preference
const getFiboValue = (level?: number): number => {
  if (level === 0.786) return 3;
  if (level === 0.618) return 2;
  if (level === 0.5) return 1;
  return 0;
};

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
        const recentData = await updateRecentVolumeSpikes(interval);

        if (isMounted) {
          setCurrentSpikes(currentData);

          // Filter recent spikes to only those at Fibonacci levels
          const fiboSpikes = recentData.filter(spike => spike.isAtFiboLevel);
          setRecentSpikes(fiboSpikes);

          // Sort by Fibonacci level preference and percentage increase
          const sortedOpportunities = [...fiboSpikes].sort((a, b) => {
            // First sort by Fibonacci level (0.786 > 0.618 > 0.5)
            const aFiboValue = getFiboValue(a.fiboLevel);
            const bFiboValue = getFiboValue(b.fiboLevel);

            if (aFiboValue !== bFiboValue) {
              return bFiboValue - aFiboValue;
            }

            // Then by percentage increase
            return b.percentageIncrease - a.percentageIncrease;
          });

          // Get top 5 opportunities
          setTopOpportunities(sortedOpportunities.slice(0, 5));
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
