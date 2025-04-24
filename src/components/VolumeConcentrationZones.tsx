'use client';

import React, { useMemo } from 'react';

export interface VolumeZone {
  priceRange: string;
  volume: number;
  type: 'bid' | 'ask';
}

interface VolumeConcentrationZonesProps {
  zones: VolumeZone[];
}

const VolumeConcentrationZones: React.FC<VolumeConcentrationZonesProps> = ({ zones }) => {
  // Calculate total volume for percentage calculations
  const totalBidVolume = useMemo(() =>
    zones.filter(zone => zone.type === 'bid').reduce((sum, zone) => sum + zone.volume, 0),
    [zones]
  );

  const totalAskVolume = useMemo(() =>
    zones.filter(zone => zone.type === 'ask').reduce((sum, zone) => sum + zone.volume, 0),
    [zones]
  );

  // Sort and prepare zones data
  const bidZones = useMemo(() =>
    zones
      .filter(zone => zone.type === 'bid')
      .sort((a, b) => b.volume - a.volume)
      .map(zone => ({
        ...zone,
        percentage: totalBidVolume > 0 ? (zone.volume / totalBidVolume) * 100 : 0
      })),
    [zones, totalBidVolume]
  );

  const askZones = useMemo(() =>
    zones
      .filter(zone => zone.type === 'ask')
      .sort((a, b) => b.volume - a.volume)
      .map(zone => ({
        ...zone,
        percentage: totalAskVolume > 0 ? (zone.volume / totalAskVolume) * 100 : 0
      })),
    [zones, totalAskVolume]
  );

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">High Volume Concentration Zones</h2>
        <div className="text-xs text-gray-400">
          Showing significant price areas with concentrated volume
        </div>
      </div>

      {zones.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 mt-2">
            No significant volume concentration zones detected
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buy Zones */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-green-400">Buy Zones</h3>
              <span className="text-xs text-gray-400">
                Total: {totalBidVolume.toLocaleString()} USDT
              </span>
            </div>
            <div className="space-y-3">
              {bidZones.map((zone) => (
                <div
                  key={`bid-${zone.priceRange}`}
                  className="relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 bg-green-500/20"
                       style={{ width: `${Math.min(zone.percentage, 100)}%` }} />
                  <div className="relative z-10 flex justify-between items-center p-3 rounded-lg border-l-4 border-green-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{zone.priceRange}</span>
                      <span className="text-xs text-green-300">
                        {zone.percentage.toFixed(1)}% of buy volume
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">
                        {(zone.volume / 1000).toFixed(0)}K
                      </span>
                      <span className="text-xs text-gray-400 ml-1">USDT</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sell Zones */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-red-400">Sell Zones</h3>
              <span className="text-xs text-gray-400">
                Total: {totalAskVolume.toLocaleString()} USDT
              </span>
            </div>
            <div className="space-y-3">
              {askZones.map((zone) => (
                <div
                  key={`ask-${zone.priceRange}`}
                  className="relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 bg-red-500/20"
                       style={{ width: `${Math.min(zone.percentage, 100)}%` }} />
                  <div className="relative z-10 flex justify-between items-center p-3 rounded-lg border-l-4 border-red-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{zone.priceRange}</span>
                      <span className="text-xs text-red-300">
                        {zone.percentage.toFixed(1)}% of sell volume
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">
                        {(zone.volume / 1000).toFixed(0)}K
                      </span>
                      <span className="text-xs text-gray-400 ml-1">USDT</span>
                    </div>
                  </div>
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
