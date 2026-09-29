import React, { useState, useEffect } from 'react';

interface AnimatedCountProps {
  value: number | string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCount: React.FC<AnimatedCountProps> = ({
  value,
  duration = 650,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  // Extract number from string if provided like "48" or "94.2%"
  const numericValue = typeof value === 'number' 
    ? value 
    : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(numericValue);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = 0;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Quartic ease out: 1 - (1 - x)^4
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (numericValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(numericValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [numericValue, duration]);

  const formattedValue = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`inline-block font-mono tracking-tight ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};
