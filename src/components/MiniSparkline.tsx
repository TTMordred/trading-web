import React from 'react';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  lineWidth?: number;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  width = 80,
  height = 30,
  color = '#10b981',
  fillColor = 'rgba(16, 185, 129, 0.2)',
  lineWidth = 1.5,
}) => {
  if (!data || data.length === 0) {
    return <div className="w-20 h-8"></div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  // Scale points to fit the canvas
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height,
  }));

  // Create SVG path
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  // Create fill path (close the path to the bottom)
  const fillPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg width={width} height={height} className="inline-block">
      {/* Fill area under the line */}
      <path d={fillPath} fill={fillColor} />
      
      {/* Line */}
      <path d={path} stroke={color} strokeWidth={lineWidth} fill="none" />
      
      {/* Last point */}
      <circle 
        cx={points[points.length - 1].x} 
        cy={points[points.length - 1].y} 
        r={3} 
        fill={color} 
      />
    </svg>
  );
};

export default MiniSparkline;
