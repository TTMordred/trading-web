'use client';

import React, { useRef, useEffect, useState } from 'react';
import { OrderBook } from '@/types/orderbook';

interface OrderBookHeatmapGridProps {
  orderBook: OrderBook | null;
  symbol: string;
}

const OrderBookHeatmapGrid: React.FC<OrderBookHeatmapGridProps> = ({
  orderBook,
  symbol
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hoverInfo, setHoverInfo] = useState<{
    price: number;
    bidVolume: number;
    askVolume: number;
    x: number;
    y: number;
  } | null>(null);
  const priceBucketsRef = useRef<{ price: number, bidVolume: number, askVolume: number }[]>([]);

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

    // Find max volume for scaling is done per bucket instead

    // Sort orders by price
    const sortedBids = [...orderBook.bids].sort((a, b) => a.price - b.price);
    const sortedAsks = [...orderBook.asks].sort((a, b) => a.price - b.price);

    // Group orders by price levels for heatmap
    const priceSteps = 100; // Number of price levels to display
    const priceStep = (adjustedMaxPrice - adjustedMinPrice) / priceSteps;

    // Create price buckets
    priceBucketsRef.current = [];

    for (let i = 0; i < priceSteps; i++) {
      const bucketPrice = adjustedMinPrice + i * priceStep;
      priceBucketsRef.current.push({
        price: bucketPrice,
        bidVolume: 0,
        askVolume: 0
      });
    }

    // Fill buckets with bid volumes
    sortedBids.forEach(bid => {
      const bucketIndex = Math.floor((bid.price - adjustedMinPrice) / priceStep);
      if (bucketIndex >= 0 && bucketIndex < priceSteps) {
        priceBucketsRef.current[bucketIndex].bidVolume += bid.price * bid.quantity;
      }
    });

    // Fill buckets with ask volumes
    sortedAsks.forEach(ask => {
      const bucketIndex = Math.floor((ask.price - adjustedMinPrice) / priceStep);
      if (bucketIndex >= 0 && bucketIndex < priceSteps) {
        priceBucketsRef.current[bucketIndex].askVolume += ask.price * ask.quantity;
      }
    });

    // Find max bucket volume for color scaling
    const maxBucketVolume = Math.max(
      ...priceBucketsRef.current.map(bucket => Math.max(bucket.bidVolume, bucket.askVolume))
    );

    // Draw heatmap background
    ctx.fillStyle = '#2D0A42'; // Dark purple background
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw price grid lines
    const gridLines = 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridLines; i++) {
      const y = i * (rect.height / gridLines);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw price labels on the right
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = i * (rect.height / gridLines);
      const price = adjustedMaxPrice - (i / gridLines) * (adjustedMaxPrice - adjustedMinPrice);
      ctx.fillText(price.toFixed(2), rect.width - 5, y + 10);
    }

    // Draw heatmap bars
    const barHeight = rect.height / priceSteps;

    priceBucketsRef.current.forEach((bucket, index) => {
      const y = rect.height - (index + 1) * barHeight;

      // Draw bid heatmap (left side)
      if (bucket.bidVolume > 0) {
        const intensity = bucket.bidVolume / maxBucketVolume;
        const width = Math.max(rect.width * 0.5 * intensity, 2); // Minimum width of 2px

        // Color gradient from yellow (high volume) to cyan (low volume)
        const r = Math.round(255 * intensity);
        const g = Math.round(255 * intensity);
        const b = Math.round(128 + 127 * (1 - intensity));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, y, width, barHeight);
      }

      // Draw ask heatmap (right side)
      if (bucket.askVolume > 0) {
        const intensity = bucket.askVolume / maxBucketVolume;
        const width = Math.max(rect.width * 0.5 * intensity, 2); // Minimum width of 2px

        // Color gradient from yellow (high volume) to cyan (low volume)
        const r = Math.round(255 * intensity);
        const g = Math.round(255 * intensity);
        const b = Math.round(128 + 127 * (1 - intensity));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(rect.width - width, y, width, barHeight);
      }
    });

    // Draw current price line
    const currentPriceY = rect.height - ((estimatedCurrentPrice - adjustedMinPrice) / (adjustedMaxPrice - adjustedMinPrice)) * rect.height;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(0, currentPriceY);
    ctx.lineTo(rect.width, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Add price label for current price
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`$${estimatedCurrentPrice.toFixed(2)}`, 5, currentPriceY - 5);

  }, [orderBook, symbol]);

  // Handle mouse move to detect hover over price levels
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !orderBook || priceBucketsRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    // Calculate which price bucket the mouse is over
    const priceSteps = priceBucketsRef.current.length;
    const barHeight = rect.height / priceSteps;
    const bucketIndex = Math.floor((rect.height - mouseY) / barHeight);

    if (bucketIndex >= 0 && bucketIndex < priceSteps) {
      const bucket = priceBucketsRef.current[bucketIndex];
      setHoverInfo({
        price: bucket.price,
        bidVolume: bucket.bidVolume,
        askVolume: bucket.askVolume,
        x: e.clientX - rect.left,
        y: mouseY
      });
    }
  };

  // Handle mouse leave to clear hover info
  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Order Book Heatmap</h2>
        {currentPrice && (
          <div className="text-white text-sm">
            Current Price: <span className="font-bold">${currentPrice.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="relative" style={{ height: '400px' }}>
        {!orderBook ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="w-full h-full rounded-md"
              style={{ display: 'block' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />

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
                <div className="bg-gray-900/95 p-4 rounded shadow-lg text-white text-sm whitespace-nowrap border border-gray-700">
                  <div className="font-bold text-center text-lg mb-3">
                    Price: ${hoverInfo.price.toFixed(2)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span>Buy Volume</span>
                      <span className="font-semibold ml-auto">{(hoverInfo.bidVolume / 1000000).toFixed(2)}M USDT</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span>Sell Volume</span>
                      <span className="font-semibold ml-auto">{(hoverInfo.askVolume / 1000000).toFixed(2)}M USDT</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-400 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400"></div>
            <span>High Volume</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-cyan-400"></div>
            <span>Low Volume</span>
          </div>
        </div>
        <div>
          Last updated: <span suppressHydrationWarning>{lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderBookHeatmapGrid;
