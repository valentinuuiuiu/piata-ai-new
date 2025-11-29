'use client';

import { useStructuredData } from '@/hooks/useStructuredData';

export function LayoutStructuredData() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Piata AI RO",
      "url": "https://piata-ai.ro",
      "logo": "https://piata-ai.ro/logo.png",
      "description": "Piața online românească cu AI. Respect pentru oameni, date private, soluții reale pentru probleme reale.",
      "foundingDate": "2024",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+40-XXX-XXX-XXX",
        "contactType": "customer service",
        "availableLanguage": "Romanian"
      },
      "sameAs": [
        "https://facebook.com/piataai.ro",
        "https://twitter.com/piataai_ro",
        "https://linkedin.com/company/piata-ai-ro"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Piata AI RO",
      "url": "https://piata-ai.ro",
      "description": "Piața online românească cu AI pentru cumpărare și vânzare",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://piata-ai.ro/cautare?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ];

  useStructuredData(schemas);

  return null;
}
