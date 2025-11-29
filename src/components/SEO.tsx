import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  structuredData?: object;
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  structuredData,
  noindex = false
}: SEOProps) {
  const fullTitle = `${title} | Piata AI RO`;
  const canonicalUrl = canonical ? `https://piata-ai.ro${canonical}` : undefined;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://piata-ai.ro${ogImage}`} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || 'https://piata-ai.ro'} />
      <meta property="og:site_name" content="Piata AI RO" />
      <meta property="og:locale" content="ro_RO" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://piata-ai.ro${ogImage}`} />

      {/* Additional SEO */}
      <meta name="author" content="Piata AI RO" />
      <meta name="language" content="ro" />
      <meta name="geo.region" content="RO" />
      <meta name="geo.country" content="Romania" />

{/* Structured Data */}
       {structuredData && (
         <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{
             __html: JSON.stringify(structuredData).replace(/<\//g, '\\u003c/')
           }}
         />
       )}
    </Head>
  );
}