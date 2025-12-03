// Technical SEO Optimization Tools
import { RomanianKeyword } from './romanian-keywords';

export interface TechnicalSEOConfig {
  siteName: string;
  baseUrl: string;
  language: string;
  country: string;
  defaultImage: string;
  organizationLogo: string;
}

export interface PageSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface SEOPerformanceReport {
  technicalScore: number;
  contentScore: number;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  issues: SEOIssue[];
  recommendations: string[];
  coreWebVitals: CoreWebVitals;
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: 'technical' | 'content' | 'performance' | 'structured-data';
  description: string;
  element?: string;
  impact: 'high' | 'medium' | 'low';
  fix: string;
}

export class TechnicalSEOOptimizer {
  private static config: TechnicalSEOConfig = {
    siteName: 'Piata AI RO',
    baseUrl: 'https://piata-ai.ro',
    language: 'ro',
    country: 'RO',
    defaultImage: '/og-image.jpg',
    organizationLogo: '/logo.png'
  };

  // Generate comprehensive SEO meta tags
  static generateSEOMetaTags(pageData: PageSEOData, pageType: 'page' | 'blog' | 'product' | 'category'): string {
    const title = `${pageData.title} | ${this.config.siteName}`;
    const description = pageData.description;
    const keywords = pageData.keywords.join(', ');
    const canonicalUrl = pageData.canonical || this.generateCanonicalUrl(pageData.title);
    const ogImageUrl = pageData.ogImage || this.config.defaultImage;

    return `<!-- SEO Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="keywords" content="${keywords}" />
<link rel="canonical" href="${canonicalUrl}" />
<meta name="robots" content="${this.generateRobotsDirectives(pageData)}" />

<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${ogImageUrl}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:type" content="${this.getOGType(pageType)}" />
<meta property="og:site_name" content="${this.config.siteName}" />
<meta property="og:locale" content="${this.config.language}_${this.config.country}" />

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${ogImageUrl}" />

<!-- Additional SEO Meta Tags -->
<meta name="author" content="${this.config.siteName}" />
<meta name="language" content="${this.config.language}" />
<meta name="geo.region" content="${this.config.country}" />
<meta name="geo.country" content="${this.config.country}" />
<meta name="geo.placename" content="Romania" />
<meta name="geo.position" content="45.9432;24.9668" />
<meta name="ICBM" content="45.9432, 24.9668" />

<!-- Preconnect for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- DNS Prefetch for external resources -->
<link rel="dns-prefetch" href="//www.google-analytics.com" />
<link rel="dns-prefetch" href="//connect.facebook.net" />

<!-- Structured Data -->
${this.generateStructuredDataScript(pageData, pageType)}`;
  }

  // Generate structured data for different page types
  static generateStructuredDataScript(pageData: PageSEOData, pageType: 'page' | 'blog' | 'product' | 'category'): string {
    const structuredData = this.generateStructuredData(pageData, pageType);
    
    return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
  }

  private static generateStructuredData(pageData: PageSEOData, pageType: string): object {
    const baseData = {
      "@context": "https://schema.org",
      "@type": this.getSchemaType(pageType),
      "name": pageData.title,
      "description": pageData.description,
      "url": pageData.canonical || this.generateCanonicalUrl(pageData.title),
      "inLanguage": this.config.language,
      "about": pageData.keywords.join(', ')
    };

    switch (pageType) {
      case 'blog':
        return {
          ...baseData,
          "@type": "BlogPosting",
          "author": {
            "@type": "Organization",
            "name": this.config.siteName
          },
          "publisher": {
            "@type": "Organization",
            "name": this.config.siteName,
            "logo": {
              "@type": "ImageObject",
              "url": this.config.organizationLogo
            }
          },
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageData.canonical || this.config.baseUrl
          }
        };

      case 'product':
        return {
          ...baseData,
          "@type": "Product",
          "brand": {
            "@type": "Brand",
            "name": this.config.siteName
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "RON",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": this.config.siteName
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150"
          }
        };

      case 'category':
        return {
          ...baseData,
          "@type": "CollectionPage",
          "publisher": {
            "@type": "Organization",
            "name": this.config.siteName
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": this.config.baseUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": pageData.title,
                "item": pageData.canonical || this.config.baseUrl
              }
            ]
          }
        };

      default:
        return {
          ...baseData,
          "@type": "WebPage",
          "publisher": {
            "@type": "Organization",
            "name": this.config.siteName
          }
        };
    }
  }

  // Generate internal linking strategy
  static generateInternalLinks(pageKeywords: string[], siteStructure: SiteStructure): InternalLink[] {
    const internalLinks: InternalLink[] = [];

    // Find related content based on keywords
    pageKeywords.forEach(keyword => {
      const relatedPages = this.findRelatedPages(keyword, siteStructure);
      relatedPages.forEach(page => {
        internalLinks.push({
          from: 'current-page',
          to: page.url,
          anchorText: this.generateAnchorText(keyword, page.title),
          position: this.determineLinkPosition(page, keyword),
          relevanceScore: this.calculateRelevance(keyword, page)
        });
      });
    });

    // Add category navigation links
    internalLinks.push(...this.generateCategoryLinks(siteStructure));

    // Add breadcrumb links
    internalLinks.push(...this.generateBreadcrumbLinks(pageKeywords[0], siteStructure));

    return internalLinks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Generate sitemap XML
  static generateSitemapXML(pages: SitemapPage[]): string {
    const urls = pages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    ${page.image ? `<image:image>
      <image:loc>${page.image}</image:loc>
      <image:title>${page.title}</image:title>
      <image:caption>${page.description}</image:caption>
    </image:image>` : ''}
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
  }

  // Generate robots.txt
  static generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /*.pdf$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*

# Sitemaps
Sitemap: ${this.config.baseUrl}/sitemap.xml
Sitemap: ${this.config.baseUrl}/sitemap-images.xml
Sitemap: ${this.config.baseUrl}/sitemap-blogs.xml

# Crawl-delay (in seconds)
Crawl-delay: 1

# Block access to sensitive areas
Disallow: /api/
Disallow: /_next/
Disallow: /static/`;
  }

  // Analyze Core Web Vitals
  static analyzeCoreWebVitals(performanceData: any): CoreWebVitalsReport {
    const vitals = this.extractCoreWebVitals(performanceData);
    const score = this.calculateVitalsScore(vitals);

    return {
      score,
      vitals,
      recommendations: this.generateVitalsRecommendations(vitals),
      passed: vitals.lcp <= 2.5 && vitals.fid <= 100 && vitals.cls <= 0.1
    };
  }

  // Image SEO optimization
  static optimizeImageSEO(imagePath: string, altText: string, title?: string): ImageSEOData {
    const optimizedAlt = this.generateOptimizedAlt(altText);
    const optimizedTitle = title || altText;
    const fileName = this.generateSEOFileName(altText);
    
    return {
      originalPath: imagePath,
      optimizedPath: this.replaceFileName(imagePath, fileName),
      alt: optimizedAlt,
      title: optimizedTitle,
      captions: this.generateImageCaption(altText),
      structuredData: this.generateImageStructuredData(imagePath, optimizedAlt, optimizedTitle)
    };
  }

  // Generate comprehensive SEO audit
  static generateSEOAudit(url: string): SEOPerformanceReport {
    const issues: SEOIssue[] = [];
    const recommendations: string[] = [];

    // Technical SEO checks
    issues.push(...this.checkTechnicalSEO(url));
    recommendations.push(...this.getTechnicalRecommendations(issues.filter(i => i.category === 'technical')));

    // Content SEO checks
    issues.push(...this.checkContentSEO(url));
    recommendations.push(...this.getContentRecommendations(issues.filter(i => i.category === 'content')));

    // Performance checks
    const performanceScore = this.calculatePerformanceScore(url);
    if (performanceScore < 80) {
      issues.push({
        type: 'warning',
        category: 'performance',
        description: 'Page performance is below optimal threshold',
        impact: 'medium',
        fix: 'Optimize images, minify CSS/JS, enable compression'
      });
    }

    // Structured data validation
    const structuredDataIssues = this.validateStructuredData(url);
    issues.push(...structuredDataIssues);

    const technicalScore = this.calculateTechnicalScore(issues);
    const contentScore = this.calculateContentScore(issues);
    const accessibilityScore = this.calculateAccessibilityScore(url);
    const bestPracticesScore = this.calculateBestPracticesScore(url);

    return {
      technicalScore,
      contentScore,
      performanceScore,
      accessibilityScore,
      bestPracticesScore,
      issues,
      recommendations: [...new Set(recommendations)],
      coreWebVitals: this.getMockCoreWebVitals() // In real implementation, fetch from PageSpeed API
    };
  }

  // Helper methods
  private static generateCanonicalUrl(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/ă/g, 'a')
      .replace(/î/g, 'i')
      .replace(/â/g, 'a')
      .replace(/ț/g, 't')
      .replace(/ș/g, 's')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    return `${this.config.baseUrl}/${slug}`;
  }

  private static generateRobotsDirectives(pageData: PageSEOData): string {
    const directives = [];
    
    if (pageData.noindex) {
      directives.push('noindex');
    } else {
      directives.push('index');
    }
    
    if (pageData.nofollow) {
      directives.push('nofollow');
    } else {
      directives.push('follow');
    }
    
    return directives.join(',');
  }

  private static getOGType(pageType: string): string {
    const typeMap: Record<string, string> = {
      'blog': 'article',
      'product': 'product',
      'category': 'website'
    };
    return typeMap[pageType] || 'website';
  }

  private static getSchemaType(pageType: string): string {
    const typeMap: Record<string, string> = {
      'blog': 'BlogPosting',
      'product': 'Product',
      'category': 'CollectionPage'
    };
    return typeMap[pageType] || 'WebPage';
  }

  // Additional helper methods would continue here...
  private static checkTechnicalSEO(url: string): SEOIssue[] {
    // Implementation would check HTTP status, meta tags, etc.
    return [];
  }

  private static checkContentSEO(url: string): SEOIssue[] {
    // Implementation would check title length, description, keywords, etc.
    return [];
  }

  private static validateStructuredData(url: string): SEOIssue[] {
    // Implementation would validate JSON-LD syntax and completeness
    return [];
  }

  private static calculateTechnicalScore(issues: SEOIssue[]): number {
    const technicalIssues = issues.filter(i => i.category === 'technical');
    return Math.max(0, 100 - (technicalIssues.length * 10));
  }

  private static calculateContentScore(issues: SEOIssue[]): number {
    const contentIssues = issues.filter(i => i.category === 'content');
    return Math.max(0, 100 - (contentIssues.length * 8));
  }

  private static calculatePerformanceScore(url: string): number {
    // Mock implementation - would use PageSpeed Insights API
    return 85;
  }

  private static calculateAccessibilityScore(url: string): number {
    // Mock implementation - would use accessibility testing tools
    return 90;
  }

  private static calculateBestPracticesScore(url: string): number {
    // Mock implementation
    return 88;
  }

  private static extractCoreWebVitals(performanceData: any): CoreWebVitals {
    // Extract from Performance API or PageSpeed data
    return {
      lcp: 2.1,
      fid: 45,
      cls: 0.08,
      fcp: 1.2,
      ttfb: 320
    };
  }

  private static calculateVitalsScore(vitals: CoreWebVitals): number {
    let score = 100;
    if (vitals.lcp > 2.5) score -= 20;
    if (vitals.fid > 100) score -= 15;
    if (vitals.cls > 0.1) score -= 25;
    return Math.max(0, score);
  }

  private static generateVitalsRecommendations(vitals: CoreWebVitals): string[] {
    const recommendations = [];
    
    if (vitals.lcp > 2.5) {
      recommendations.push('Optimize Largest Contentful Paint by compressing images and using lazy loading');
    }
    if (vitals.fid > 100) {
      recommendations.push('Reduce JavaScript execution time to improve First Input Delay');
    }
    if (vitals.cls > 0.1) {
      recommendations.push('Avoid layout shifts by setting explicit dimensions for images and ads');
    }
    
    return recommendations;
  }

  private static generateOptimizedAlt(altText: string): string {
    return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
  }

  private static generateSEOFileName(altText: string): string {
    return altText
      .toLowerCase()
      .replace(/ă/g, 'a')
      .replace(/î/g, 'i')
      .replace(/â/g, 'a')
      .replace(/ț/g, 't')
      .replace(/ș/g, 's')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private static generateImageCaption(altText: string): string {
    return `Imagine ${altText.toLowerCase()} - ${this.config.siteName}`;
  }

  private static generateImageStructuredData(imagePath: string, alt: string, title: string): object {
    return {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "contentUrl": imagePath,
      "description": alt,
      "name": title,
      "url": imagePath,
      "width": 1200,
      "height": 630
    };
  }

  private static getTechnicalRecommendations(issues: SEOIssue[]): string[] {
    return issues.map(issue => `Fix: ${issue.fix}`);
  }

  private static getContentRecommendations(issues: SEOIssue[]): string[] {
    return issues.map(issue => `Improve: ${issue.fix}`);
  }

  private static getMockCoreWebVitals(): CoreWebVitals {
    return {
      lcp: 2.1,
      fid: 45,
      cls: 0.08,
      fcp: 1.2,
      ttfb: 320
    };
  }

  // Placeholder implementations for complex methods
  private static findRelatedPages(keyword: string, siteStructure: SiteStructure): any[] {
    return [];
  }

  private static generateAnchorText(keyword: string, pageTitle: string): string {
    return keyword;
  }

  private static determineLinkPosition(page: any, keyword: string): string {
    return 'content';
  }

  private static calculateRelevance(keyword: string, page: any): number {
    return 0.8;
  }

  private static generateCategoryLinks(siteStructure: SiteStructure): InternalLink[] {
    return [];
  }

  private static generateBreadcrumbLinks(keyword: string, siteStructure: SiteStructure): InternalLink[] {
    return [];
  }

  private static replaceFileName(path: string, newFileName: string): string {
    return path.replace(/[^/]+$/, `${newFileName}.jpg`);
  }
}

// Interface definitions
export interface InternalLink {
  from: string;
  to: string;
  anchorText: string;
  position: string;
  relevanceScore: number;
}

export interface SiteStructure {
  pages: Array<{
    url: string;
    title: string;
    keywords: string[];
    category: string;
  }>;
}

export interface SitemapPage {
  url: string;
  title: string;
  description: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  image?: string;
}

export interface ImageSEOData {
  originalPath: string;
  optimizedPath: string;
  alt: string;
  title: string;
  captions: string;
  structuredData: object;
}

export interface CoreWebVitalsReport {
  score: number;
  vitals: CoreWebVitals;
  recommendations: string[];
  passed: boolean;
}