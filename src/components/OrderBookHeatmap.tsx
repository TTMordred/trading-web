'use client';

import React, { useRef, useEffect } from 'react';
import { OrderBook } from '@/types/orderbook';

interface OrderBookHeatmapProps {
  orderBook: OrderBook | null;
  timeScale: string;
  symbol: string;
}

const OrderBookHeatmap: React.FC<OrderBookHeatmapProps> = ({ 
  orderBook, 
  timeScale,
  symbol
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!orderBook || !canvasRef.current) return;
    
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
    
    // Find max volume for color intensity scaling
    const allVolumes = [...orderBook.bids, ...orderBook.asks].map(item => item.quantity);
    const maxVolume = Math.max(...allVolumes);
    
    // Draw heatmap
    const drawHeatmap = () => {
      // Draw background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#2a2a3e';
      ctx.lineWidth = 0.5;
      
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
        ctx.fillStyle = '#8a8a9a';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(price.toFixed(2), rect.width - 5, y - 5);
      }
      
      // Draw bid volumes (green)
      orderBook.bids.forEach(bid => {
        const y = rect.height - ((bid.price - minPrice) / priceRange) * rect.height;
        const intensity = Math.min(bid.quantity / maxVolume, 1);
        
        // Green gradient from dark to bright
        const green = Math.floor(100 + intensity * 155);
        ctx.fillStyle = `rgb(0, ${green}, 0)`;
        
        // Draw horizontal line at price level with width based on volume
        ctx.fillRect(0, y, rect.width * 0.5 * intensity, 2);
      });
      
      // Draw ask volumes (red)
      orderBook.asks.forEach(ask => {
        const y = rect.height - ((ask.price - minPrice) / priceRange) * rect.height;
        const intensity = Math.min(ask.quantity / maxVolume, 1);
        
        // Red gradient from dark to bright
        const red = Math.floor(100 + intensity * 155);
        ctx.fillStyle = `rgb(${red}, 0, 0)`;
        
        // Draw horizontal line at price level with width based on volume
        ctx.fillRect(rect.width * 0.5, y, rect.width * 0.5 * intensity, 2);
      });
      
      // Draw legend
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 150, 60);
      
      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(`${symbol} Order Book Heatmap (${timeScale})`, 20, 30);
      
      // Color legend
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(20, 40, 20, 10);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(20, 55, 20, 10);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Bids (Buy Orders)', 50, 50);
      ctx.fillText('Asks (Sell Orders)', 50, 65);
    };
    
    drawHeatmap();
    
  }, [orderBook, timeScale, symbol]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">{symbol} Order Book Heatmap</h2>
      <div className="relative" style={{ height: '400px' }}>
        {!orderBook ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        )}
      </div>
    </div>
  );
};

export default OrderBookHeatmap;
