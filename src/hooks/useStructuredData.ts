import { useEffect } from 'react';

/**
 * Safe hook for injecting structured data (JSON-LD) into the DOM
 * Avoids XSS vulnerabilities and hydration mismatches
 */
export function useStructuredData(schemas: Record<string, any>[]) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scripts: HTMLScriptElement[] = [];

    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      scripts.push(script);
    });

    // Cleanup function
    return () => {
      scripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [schemas]);
}
