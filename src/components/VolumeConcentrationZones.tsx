'use client';

import React from 'react';

export interface VolumeZone {
  priceRange: string;
  volume: number;
  type: 'bid' | 'ask';
}

interface VolumeConcentrationZonesProps {
  zones: VolumeZone[];
}

const VolumeConcentrationZones: React.FC<VolumeConcentrationZonesProps> = ({ zones }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">High Volume Concentration Zones</h2>

      {zones.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No significant volume concentration zones detected
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buy Zones */}
          <div>
            <h3 className="text-lg font-medium text-green-500 mb-2">Buy Zones</h3>
            <div className="space-y-2">
              {zones
                .filter(zone => zone.type === 'bid')
                .sort((a, b) => b.volume - a.volume)
                .map((zone) => (
                  <div
                    key={`bid-${zone.priceRange}`}
                    className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500"
                  >
                    <span className="font-medium">{zone.priceRange}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {zone.volume.toLocaleString()} USDT
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Sell Zones */}
          <div>
            <h3 className="text-lg font-medium text-red-500 mb-2">Sell Zones</h3>
            <div className="space-y-2">
              {zones
                .filter(zone => zone.type === 'ask')
                .sort((a, b) => b.volume - a.volume)
                .map((zone) => (
                  <div
                    key={`ask-${zone.priceRange}`}
                    className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500"
                  >
                    <span className="font-medium">{zone.priceRange}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {zone.volume.toLocaleString()} USDT
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolumeConcentrationZones;
