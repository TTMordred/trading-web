'use client';

import React, { useRef, useEffect, useState } from 'react';
import { OrderBook, OrderBookEntry } from '@/types/orderbook';

interface OrderBookHeatmapProps {
  orderBook: OrderBook | null;
  timeScale: string;
  symbol: string;
}

interface HoverInfo {
  price: number;
  quantity: number;
  value: number;
  type: 'bid' | 'ask';
  x: number;
  y: number;
}

const OrderBookHeatmap: React.FC<OrderBookHeatmapProps> = ({
  orderBook,
  timeScale,
  symbol
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

    // Find min and max prices for scaling
    const allPrices = [...orderBook.bids, ...orderBook.asks].map(item => item.price);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Estimate current price (midpoint between highest bid and lowest ask)
    const highestBid = Math.max(...orderBook.bids.map(bid => bid.price));
    const lowestAsk = Math.min(...orderBook.asks.map(ask => ask.price));
    const estimatedCurrentPrice = (highestBid + lowestAsk) / 2;
    setCurrentPrice(estimatedCurrentPrice);

    // Find max volume for color intensity scaling
    const allVolumes = [...orderBook.bids, ...orderBook.asks].map(item => item.quantity);
    const maxVolume = Math.max(...allVolumes);

    // Draw heatmap
    const drawHeatmap = () => {
      // Draw background
      ctx.fillStyle = '#0f172a'; // Dark blue background
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;

      // Vertical grid lines
      const verticalLines = 20;
      for (let i = 0; i <= verticalLines; i++) {
        const x = (i / verticalLines) * rect.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }

      // Horizontal grid lines (price levels)
      const priceStep = priceRange / 10;
      for (let i = 0; i <= 10; i++) {
        const y = rect.height - (i / 10) * rect.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();

        // Price labels
        const price = minPrice + i * priceStep;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(price.toFixed(2), rect.width - 8, y - 5);
      }

      // Draw current price line
      if (estimatedCurrentPrice) {
        const currentPriceY = rect.height - ((estimatedCurrentPrice - minPrice) / priceRange) * rect.height;
        ctx.strokeStyle = '#3b82f6'; // Blue
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(0, currentPriceY);
        ctx.lineTo(rect.width, currentPriceY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Current price label
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Current: ${estimatedCurrentPrice.toFixed(2)}`, 10, currentPriceY - 5);
      }

      // Add labels for buy and sell sides
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BUY ORDERS', rect.width * 0.25, 30);

      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('SELL ORDERS', rect.width * 0.75, 30);

      // Draw a thin vertical line to separate buy and sell sides
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(rect.width * 0.5, 0);
      ctx.lineTo(rect.width * 0.5, rect.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Clear the processed data arrays
      processedBidsRef.current = [];
      processedAsksRef.current = [];

      // Draw bid volumes (green) with enhanced visualization
      orderBook.bids.forEach(bid => {
        const y = rect.height - ((bid.price - minPrice) / priceRange) * rect.height;
        const intensity = Math.min(bid.quantity / maxVolume, 1);
        const width = Math.max(rect.width * 0.5 * intensity, 2); // Ensure minimum visibility

        // Store processed bid data for hover detection
        processedBidsRef.current.push({
          price: bid.price,
          quantity: bid.quantity,
          y,
          width
        });

        // Green gradient with alpha for better visualization
        const alpha = 0.3 + intensity * 0.7; // Vary transparency based on volume
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;

        // Draw horizontal bar at price level with width based on volume
        ctx.fillRect(0, y - 1, width, 3);

        // Add glow effect for high volume orders
        if (intensity > 0.7) {
          ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
          ctx.shadowBlur = 5;
          ctx.fillRect(0, y - 1, width, 3);
          ctx.shadowBlur = 0;

          // Add volume label for significant orders
          if (intensity > 0.85) {
            const volumeText = `${(bid.quantity * bid.price / 1000).toFixed(0)}K`;
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(volumeText, width + 5, y + 3);
          }
        }
      });

      // Draw ask volumes (red) with enhanced visualization
      orderBook.asks.forEach(ask => {
        const y = rect.height - ((ask.price - minPrice) / priceRange) * rect.height;
        const intensity = Math.min(ask.quantity / maxVolume, 1);
        const width = Math.max(rect.width * 0.5 * intensity, 2); // Ensure minimum visibility

        // Store processed ask data for hover detection
        processedAsksRef.current.push({
          price: ask.price,
          quantity: ask.quantity,
          y,
          width
        });

        // Red gradient with alpha for better visualization
        const alpha = 0.3 + intensity * 0.7; // Vary transparency based on volume
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;

        // Draw horizontal bar at price level with width based on volume
        ctx.fillRect(rect.width - width, y - 1, width, 3);

        // Add glow effect for high volume orders
        if (intensity > 0.7) {
          ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
          ctx.shadowBlur = 5;
          ctx.fillRect(rect.width - width, y - 1, width, 3);
          ctx.shadowBlur = 0;

          // Add volume label for significant orders
          if (intensity > 0.85) {
            const volumeText = `${(ask.quantity * ask.price / 1000).toFixed(0)}K`;
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(volumeText, rect.width - width - 5, y + 3);
          }
        }
      });

      // Draw legend with improved styling
      const legendWidth = 240;
      const legendHeight = 130;
      const legendX = 10;
      const legendY = 10;

      // Semi-transparent background with blur effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Title with timeframe
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${symbol} Order Book Heatmap`, legendX + 10, legendY + 20);

      // Timeframe
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Timeframe: ${timeScale}`, legendX + 10, legendY + 38);

      // Color legend indicators with labels
      // Bid indicator
      const gradientBid = ctx.createLinearGradient(legendX + 10, 0, legendX + 40, 0);
      gradientBid.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      gradientBid.addColorStop(1, 'rgba(16, 185, 129, 1)');
      ctx.fillStyle = gradientBid;
      ctx.fillRect(legendX + 10, legendY + 50, 30, 10);

      // Ask indicator
      const gradientAsk = ctx.createLinearGradient(legendX + 10, 0, legendX + 40, 0);
      gradientAsk.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradientAsk.addColorStop(1, 'rgba(239, 68, 68, 1)');
      ctx.fillStyle = gradientAsk;
      ctx.fillRect(legendX + 10, legendY + 70, 30, 10);

      // Legend text
      ctx.fillStyle = '#10b981'; // Green
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('Bids (Buy Orders)', legendX + 50, legendY + 58);

      ctx.fillStyle = '#ef4444'; // Red
      ctx.fillText('Asks (Sell Orders)', legendX + 50, legendY + 78);

      // Add intensity explanation
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Color intensity indicates order volume', legendX + 10, legendY + 95);

      // Add glow explanation
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Glowing bars represent significant volume', legendX + 10, legendY + 110);

      // Add hover hint
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 10px Inter, sans-serif';
      ctx.fillText('Hover over bars in chart for detailed volume info', legendX + 10, legendY + 125);
    };

    drawHeatmap();

  }, [orderBook, timeScale, symbol]);

  // Handle mouse move to detect hover over bars
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !orderBook) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over a bid bar
    const hoveredBid = processedBidsRef.current.find(bid =>
      y >= bid.y - 5 && y <= bid.y + 5 && x >= 0 && x <= bid.width
    );

    if (hoveredBid) {
      setHoverInfo({
        price: hoveredBid.price,
        quantity: hoveredBid.quantity,
        value: hoveredBid.price * hoveredBid.quantity,
        type: 'bid',
        x: hoveredBid.width + 10,
        y: hoveredBid.y
      });
      return;
    }

    // Check if hovering over an ask bar
    const canvasWidth = rect.width;
    const hoveredAsk = processedAsksRef.current.find(ask =>
      y >= ask.y - 5 && y <= ask.y + 5 &&
      x >= (canvasWidth - ask.width) && x <= canvasWidth
    );

    if (hoveredAsk) {
      setHoverInfo({
        price: hoveredAsk.price,
        quantity: hoveredAsk.quantity,
        value: hoveredAsk.price * hoveredAsk.quantity,
        type: 'ask',
        x: canvasWidth - hoveredAsk.width - 10,
        y: hoveredAsk.y
      });
      return;
    }

    // If not hovering over any bar, clear the hover info
    setHoverInfo(null);
  };

  // Handle mouse leave to clear hover info
  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{symbol} Order Book Heatmap</h2>
        {currentPrice && (
          <div className="text-white bg-blue-600 px-3 py-1 rounded-md text-sm">
            Current Price: <span className="font-bold">${currentPrice.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="relative" style={{ height: '450px' }}>
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
                  top: `${hoverInfo.y - 40}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className={`${hoverInfo.type === 'bid' ? 'bg-green-800' : 'bg-red-800'} p-2 rounded shadow-lg text-white text-xs whitespace-nowrap`}>
                  <div className="font-bold">${hoverInfo.price.toFixed(2)}</div>
                  <div>Qty: {hoverInfo.quantity.toFixed(4)}</div>
                  <div>Value: ${hoverInfo.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
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
