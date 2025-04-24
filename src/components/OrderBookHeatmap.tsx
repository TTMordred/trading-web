'use client';

import React, { useRef, useEffect, useState } from 'react';
import { OrderBook, OrderBookEntry } from '@/types/orderbook';

interface OrderBookHeatmapProps {
  orderBook: OrderBook | null;
  symbol: string;
}

interface HoverInfo {
  price: number;
  cumulativeVolume: number;
  quantity: number;
  type: 'bid' | 'ask';
  x: number;
  y: number;
}

const OrderBookHeatmap: React.FC<OrderBookHeatmapProps> = ({
  orderBook,
  symbol
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hoverPoint, setHoverPoint] = useState<{x: number, y: number, type: 'bid' | 'ask'} | null>(null);

  // Store processed order book data for hover detection
  const processedBidsRef = useRef<Array<OrderBookEntry & { y: number, width: number }>>([]);
  const processedAsksRef = useRef<Array<OrderBookEntry & { y: number, width: number }>>([]);

  useEffect(() => {
    if (!orderBook || !canvasRef.current) return;

    // Update the last updated timestamp
    setLastUpdated(new Date());

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match its display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Estimate current price (midpoint between highest bid and lowest ask)
    const highestBid = Math.max(...orderBook.bids.map(bid => bid.price));
    const lowestAsk = Math.min(...orderBook.asks.map(ask => ask.price));
    const estimatedCurrentPrice = (highestBid + lowestAsk) / 2;
    setCurrentPrice(estimatedCurrentPrice);

    // Use the full range of orders
    // Find min and max prices from all orders
    const allPrices = [...orderBook.bids.map(bid => bid.price), ...orderBook.asks.map(ask => ask.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Add a small buffer (5%) to the price range for better visualization
    const buffer = priceRange * 0.05;
    const adjustedMinPrice = minPrice - buffer;
    const adjustedMaxPrice = maxPrice + buffer;

    // Find max volume for scaling
    const allVolumes = [...orderBook.bids, ...orderBook.asks].map(item => item.quantity * item.price);
    const maxVolume = Math.max(...allVolumes);

    // Sort orders by price
    const sortedBids = [...orderBook.bids].sort((a, b) => a.price - b.price);
    const sortedAsks = [...orderBook.asks].sort((a, b) => a.price - b.price);

    // Calculate cumulative volumes
    let cumulativeBidVolume = 0;
    const bidsWithCumulative = sortedBids.map(bid => {
      const volume = bid.price * bid.quantity;
      cumulativeBidVolume += volume;
      return { ...bid, cumulativeVolume: cumulativeBidVolume };
    });

    let cumulativeAskVolume = 0;
    const asksWithCumulative = sortedAsks.map(ask => {
      const volume = ask.price * ask.quantity;
      cumulativeAskVolume += volume;
      return { ...ask, cumulativeVolume: cumulativeAskVolume };
    });

    // Find max cumulative volume for scaling
    const maxCumulativeVolume = Math.max(
      bidsWithCumulative.length > 0 ? bidsWithCumulative[bidsWithCumulative.length - 1].cumulativeVolume : 0,
      asksWithCumulative.length > 0 ? asksWithCumulative[asksWithCumulative.length - 1].cumulativeVolume : 0
    );

    // Draw order book visualization
    const drawOrderBook = () => {
      // Draw background
      ctx.fillStyle = '#0f172a'; // Dark blue background
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw horizontal grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 0.5;

      // Y-axis labels and grid lines (volume)
      const volumeSteps = 5;
      for (let i = 0; i <= volumeSteps; i++) {
        const y = (i / volumeSteps) * (rect.height - 40); // Leave space for price labels
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();

        // Volume labels
        const volume = maxCumulativeVolume * (1 - i / volumeSteps);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${(volume / 1000).toFixed(0)}K`, 5, y + 12);

        // Right side volume labels
        ctx.textAlign = 'right';
        ctx.fillText(`${(volume / 1000).toFixed(0)}K`, rect.width - 5, y + 12);
      }

      // Clear the processed data arrays
      processedBidsRef.current = [];
      processedAsksRef.current = [];

      // Calculate price to x-coordinate mapping
      const priceToX = (price: number) => {
        return rect.width * ((price - adjustedMinPrice) / (adjustedMaxPrice - adjustedMinPrice));
      };

      // Draw price labels at the bottom
      const priceLabelCount = 10;
      for (let i = 0; i <= priceLabelCount; i++) {
        const price = adjustedMinPrice + (i / priceLabelCount) * (adjustedMaxPrice - adjustedMinPrice);
        const x = priceToX(price);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(price.toFixed(2), x, rect.height - 5);
      }

      // Draw current price line and label
      if (estimatedCurrentPrice) {
        const currentPriceX = priceToX(estimatedCurrentPrice);

        // Current price line
        ctx.strokeStyle = '#3b82f6'; // Blue
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(currentPriceX, 0);
        ctx.lineTo(currentPriceX, rect.height - 20); // Stop above price labels
        ctx.stroke();
        ctx.setLineDash([]);

        // Current price label at top
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Current Price: ${estimatedCurrentPrice.toFixed(2)}`, currentPriceX, 15);
      }

      // Draw bid bars (green)
      sortedBids.forEach(bid => {
        const x = priceToX(bid.price);
        const volume = bid.price * bid.quantity;
        const barHeight = Math.min((volume / maxVolume) * (rect.height - 40) * 0.8, rect.height - 40);

        // Store processed bid data for hover detection
        processedBidsRef.current.push({
          price: bid.price,
          quantity: bid.quantity,
          y: rect.height - 40 - barHeight,
          width: 3 // Bar width
        });

        // Draw vertical bar
        ctx.fillStyle = '#10b981'; // Green
        ctx.fillRect(x - 1.5, rect.height - 40 - barHeight, 3, barHeight);
      });

      // Draw ask bars (red)
      sortedAsks.forEach(ask => {
        const x = priceToX(ask.price);
        const volume = ask.price * ask.quantity;
        const barHeight = Math.min((volume / maxVolume) * (rect.height - 40) * 0.8, rect.height - 40);

        // Store processed ask data for hover detection
        processedAsksRef.current.push({
          price: ask.price,
          quantity: ask.quantity,
          y: rect.height - 40 - barHeight,
          width: 3 // Bar width
        });

        // Draw vertical bar
        ctx.fillStyle = '#ef4444'; // Red
        ctx.fillRect(x - 1.5, rect.height - 40 - barHeight, 3, barHeight);
      });

      // Draw cumulative volume lines
      // Bid cumulative line (green)
      ctx.beginPath();
      ctx.moveTo(priceToX(sortedBids[0]?.price || minPrice), rect.height - 40);

      bidsWithCumulative.forEach(bid => {
        const x = priceToX(bid.price);
        const y = rect.height - 40 - (bid.cumulativeVolume / maxCumulativeVolume) * (rect.height - 40);
        ctx.lineTo(x, y);
      });

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)'; // Green with transparency
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fill area under bid line
      ctx.lineTo(priceToX(sortedBids[sortedBids.length - 1]?.price || minPrice), rect.height - 40);
      ctx.lineTo(priceToX(sortedBids[0]?.price || minPrice), rect.height - 40);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fill();

      // Ask cumulative line (red)
      ctx.beginPath();
      ctx.moveTo(priceToX(sortedAsks[0]?.price || maxPrice), rect.height - 40);

      asksWithCumulative.forEach(ask => {
        const x = priceToX(ask.price);
        const y = rect.height - 40 - (ask.cumulativeVolume / maxCumulativeVolume) * (rect.height - 40);
        ctx.lineTo(x, y);
      });

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)'; // Red with transparency
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fill area under ask line
      ctx.lineTo(priceToX(sortedAsks[sortedAsks.length - 1]?.price || maxPrice), rect.height - 40);
      ctx.lineTo(priceToX(sortedAsks[0]?.price || maxPrice), rect.height - 40);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fill();

      // Add small watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('CoinGlass', rect.width - 10, rect.height - 25);
    };

    drawOrderBook();

  }, [orderBook, symbol]);

  // Handle mouse move to detect hover over cumulative volume lines
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !orderBook) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use the full range of orders for hover detection
    // Find min and max prices from all orders
    const allPrices = [...orderBook.bids.map(bid => bid.price), ...orderBook.asks.map(ask => ask.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Add a small buffer (5%) to the price range for better visualization
    const buffer = priceRange * 0.05;
    const adjustedMinPrice = minPrice - buffer;
    const adjustedMaxPrice = maxPrice + buffer;

    // Convert x position to price
    const mousePrice = adjustedMinPrice + (x / rect.width) * (adjustedMaxPrice - adjustedMinPrice);

    // Sort orders by price
    const sortedBids = [...orderBook.bids].sort((a, b) => a.price - b.price);
    const sortedAsks = [...orderBook.asks].sort((a, b) => a.price - b.price);

    // Find max cumulative volume for scaling
    let cumulativeBidVolume = 0;
    const bidsWithCumulative = sortedBids.map(bid => {
      const volume = bid.price * bid.quantity;
      cumulativeBidVolume += volume;
      return { ...bid, cumulativeVolume: cumulativeBidVolume };
    });

    let cumulativeAskVolume = 0;
    const asksWithCumulative = sortedAsks.map(ask => {
      const volume = ask.price * ask.quantity;
      cumulativeAskVolume += volume;
      return { ...ask, cumulativeVolume: cumulativeAskVolume };
    });

    const maxCumulativeVolume = Math.max(
      bidsWithCumulative.length > 0 ? bidsWithCumulative[bidsWithCumulative.length - 1].cumulativeVolume : 0,
      asksWithCumulative.length > 0 ? asksWithCumulative[asksWithCumulative.length - 1].cumulativeVolume : 0
    );

    // Find closest point on the cumulative volume lines
    // First determine if we're closer to bids or asks based on price
    const midPrice = (minPrice + maxPrice) / 2;

    if (mousePrice < midPrice) {
      // Closer to bids (green) side
      const closestBid = bidsWithCumulative.reduce((closest, current) => {
        return Math.abs(current.price - mousePrice) < Math.abs(closest.price - mousePrice) ? current : closest;
      }, bidsWithCumulative[0] || { price: 0, quantity: 0, cumulativeVolume: 0 });

      if (closestBid && closestBid.price > 0) {
        // Calculate y position on the cumulative line
        const lineY = rect.height - 40 - (closestBid.cumulativeVolume / maxCumulativeVolume) * (rect.height - 40);

        // Only show tooltip if mouse is close to the line (within 30px)
        if (Math.abs(y - lineY) < 30) {
          const x = (closestBid.price - adjustedMinPrice) / (adjustedMaxPrice - adjustedMinPrice) * rect.width;
          setHoverPoint({ x, y: lineY, type: 'bid' });
          setHoverInfo({
            price: closestBid.price,
            quantity: closestBid.quantity,
            cumulativeVolume: closestBid.cumulativeVolume,
            type: 'bid',
            x,
            y: lineY
          });
          return;
        }
      }
    } else {
      // Closer to asks (red) side
      const closestAsk = asksWithCumulative.reduce((closest, current) => {
        return Math.abs(current.price - mousePrice) < Math.abs(closest.price - mousePrice) ? current : closest;
      }, asksWithCumulative[0] || { price: 0, quantity: 0, cumulativeVolume: 0 });

      if (closestAsk && closestAsk.price > 0) {
        // Calculate y position on the cumulative line
        const lineY = rect.height - 40 - (closestAsk.cumulativeVolume / maxCumulativeVolume) * (rect.height - 40);

        // Only show tooltip if mouse is close to the line (within 30px)
        if (Math.abs(y - lineY) < 30) {
          const x = (closestAsk.price - adjustedMinPrice) / (adjustedMaxPrice - adjustedMinPrice) * rect.width;
          setHoverPoint({ x, y: lineY, type: 'ask' });
          setHoverInfo({
            price: closestAsk.price,
            quantity: closestAsk.quantity,
            cumulativeVolume: closestAsk.cumulativeVolume,
            type: 'ask',
            x,
            y: lineY
          });
          return;
        }
      }
    }

    // If not hovering near any line, clear the hover info
    setHoverInfo(null);
    setHoverPoint(null);
  };

  // Handle mouse leave to clear hover info
  const handleMouseLeave = () => {
    setHoverInfo(null);
    setHoverPoint(null);
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-6">
      <div className="flex flex-col items-center mb-4">
        {currentPrice && (
          <div className="text-white text-sm mb-2">
            Current Price: <span className="font-bold">${currentPrice.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span>Buy Orders (Bids)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>Sell Orders (Asks)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500"></div>
            <span>Cumulative Buy Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500"></div>
            <span>Cumulative Sell Volume</span>
          </div>
        </div>
      </div>
      <div className="relative" style={{ height: '600px' }}>
        {!orderBook ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="relative w-full h-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-md"
                style={{ display: 'block' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />

              {/* Hover point marker */}
              {hoverPoint && (
                <div
                  className={`absolute w-4 h-4 rounded-full border-2 ${
                    hoverPoint.type === 'bid' ? 'border-green-400 bg-green-800' : 'border-red-400 bg-red-800'
                  }`}
                  style={{
                    left: `${hoverPoint.x}px`,
                    top: `${hoverPoint.y}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
              )}
            </div>

            {/* Hover tooltip */}
            {hoverInfo && (
              <div
                className="absolute pointer-events-none z-10"
                style={{
                  left: `${hoverInfo.x}px`,
                  top: `${hoverInfo.y - 60}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-gray-900/90 p-3 rounded shadow-lg text-white text-xs whitespace-nowrap border border-gray-700">
                  <div className="font-bold text-center text-base mb-2">
                    Price: ${hoverInfo.price.toFixed(2)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${hoverInfo.type === 'bid' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span>{hoverInfo.type === 'bid' ? 'Cumulative Buy Volume' : 'Cumulative Sell Volume'}</span>
                      <span className="font-semibold ml-auto">{(hoverInfo.cumulativeVolume / 1000000).toFixed(2)}M USDT</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${hoverInfo.type === 'bid' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span>{hoverInfo.type === 'bid' ? 'Buy' : 'Sell'}</span>
                      <span className="font-semibold ml-auto">{hoverInfo.quantity.toFixed(4)} BTC</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-400 text-right">
        Last updated: <span suppressHydrationWarning>{lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default OrderBookHeatmap;
