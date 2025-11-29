'use client';

import { useEffect, useState } from 'react';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    lcp: null as number | null,
    fid: null as number | null,
    cls: null as number | null,
    fcp: null as number | null,
  });

  useEffect(() => {
    // Basic performance monitoring without external dependencies
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
          console.log('LCP:', lastEntry.startTime);
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.log('LCP observation not supported');
      }

      // Monitor First Contentful Paint (FCP)
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            console.log('FCP:', entry.startTime);
          }
        });
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.log('Paint observation not supported');
      }

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsValue }));
        console.log('CLS:', clsValue);
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.log('Layout shift observation not supported');
      }

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.log('FID observation not supported');
      }

      return () => {
        observer.disconnect();
        paintObserver.disconnect();
        layoutShiftObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}