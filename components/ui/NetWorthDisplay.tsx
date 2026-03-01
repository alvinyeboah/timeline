'use client';

import { useEffect, useState, useRef } from 'react';

interface Props {
  value: number;
  className?: string;
  prefix?: string;
  duration?: number;
}

export default function NetWorthDisplay({ value, className = '', prefix = '$', duration = 800 }: Props) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const steps = 30;
    const increment = (end - start) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.round(start + increment * step);
      setDisplayed(step >= steps ? end : current);
      if (step >= steps) {
        clearInterval(timer);
        prevRef.current = end;
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{displayed.toLocaleString('en-CA')}
    </span>
  );
}
