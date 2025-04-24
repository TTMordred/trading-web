'use client';

import React, { useState, useEffect } from 'react';

interface ClientTimeProps {
  format?: 'time' | 'datetime';
  timestamp?: number;
  className?: string;
}

const ClientTime: React.FC<ClientTimeProps> = ({ 
  format = 'time', 
  timestamp, 
  className = '' 
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    // If a timestamp is provided, format that specific time
    // Otherwise, use the current time
    const date = timestamp ? new Date(timestamp) : new Date();
    
    if (format === 'time') {
      setTimeString(date.toLocaleTimeString());
    } else {
      setTimeString(date.toLocaleString());
    }
    
    // If no timestamp is provided, update the time every second
    if (!timestamp) {
      const intervalId = setInterval(() => {
        const now = new Date();
        if (format === 'time') {
          setTimeString(now.toLocaleTimeString());
        } else {
          setTimeString(now.toLocaleString());
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [format, timestamp]);

  return <span className={className}>{timeString}</span>;
};

export default ClientTime;
