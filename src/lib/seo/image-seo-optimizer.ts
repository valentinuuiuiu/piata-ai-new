// Image SEO Optimization System for Romanian Marketplace
import { RomanianKeyword } from './romanian-keywords';

export interface ImageOptimizationConfig {
  targetFormats: ('webp' | 'avif' | 'jpeg' | 'png')[];
  qualityLevels: {
    high: number;
    medium: number;
    low: number;
  };
  maxFileSizes: {
    thumbnail: number;
    medium: number;
    large: number;
    original: number;
  };
  compressionSettings: {
    mozjpeg: boolean;
    oxipng: boolean;
    webp: boolean;
    avif: boolean;
  };
}

export interface ImageSEOData {
  originalPath: string;
  optimizedPaths: OptimizedImagePath[];
  altText: string;
  titleText: string;
  caption: string;
  structuredData: ImageStructuredData;
  seoScore: number;
  performanceMetrics: ImagePerformanceMetrics;
  recommendations: ImageOptimizationRecommendation[];
}

export interface OptimizedImagePath {
  format: string;
  path: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  quality: string;
  url: string;
}

export interface ImageStructuredData {
  "@context": "https://schema.org";
  "@type": "ImageObject";
  contentUrl: string;
  url: string;
  width: number;
  height: number;
  encodingFormat: string;
  caption: string;
  description: string;
  name: string;
  author?: {
    "@type": "Organization";
    name: string;
  };
  copyrightHolder?: {
    "@type": "Organization";
    name: string;
  };
  creditText?: string;
  keywords?: string[];
  locationCreated?: {
    "@type": "Place";
    name: string;
  };
}

export interface ImagePerformanceMetrics {
  loadTime: number;
  fileSize: number;
  compressionRatio: number;
  lcpImpact: number;
  bandwidthSavings: number;
  userExperienceScore: number;
}

export interface ImageOptimizationRecommendation {
  type: 'compression' | 'format' | 'alt-text' | 'structured-data' | 'responsive';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ResponsiveImageConfig {
  breakpoints: number[];
  aspectRatios: ('1:1' | '4:3' | '16:9' | '3:2')[];
  formats: ('webp' | 'avif' | 'jpeg')[];
  qualitySettings: {
    [key: string]: {
      quality: number;
      progressive: boolean;
      optimize: boolean;
    };
  };
}

export interface ImageLazyLoadingConfig {
  enabled: boolean;
  threshold: number;
  rootMargin: string;
  placeholderType: 'blur' | 'low-quality' | 'color';
  loadingStrategy: 'eager' | 'lazy' | 'auto';
}

export class ImageSEOOptimizer {
  private static config: ImageOptimizationConfig = {
    targetFormats: ['webp', 'avif', 'jpeg'],
    qualityLevels: {
      high: 85,
      medium: 70,
      low: 55
    },
    maxFileSizes: {
      thumbnail: 50 * 1024, // 50KB
      medium: 200 * 1024, // 200KB
      large: 500 * 1024, // 500KB
      original: 2 * 1024 * 1024 // 2MB
    },
    compressionSettings: {
      mozjpeg: true,
      oxipng: true,
      webp: true,
      avif: true
    }
  };

  private static responsiveConfig: ResponsiveImageConfig = {
    breakpoints: [320, 640, 768, 1024, 1280, 1536],
    aspectRatios: ['1:1', '4:3', '16:9', '3:2'],
    formats: ['webp', 'avif', 'jpeg'],
    qualitySettings: {
      '320': { quality: 60, progressive: false, optimize: true },
      '640': { quality: 70, progressive: true, optimize: true },
      '768': { quality: 75, progressive: true, optimize: true },
      '1024': { quality: 80, progressive: true, optimize: true },
      '1280': { quality: 85, progressive: true, optimize: true },
      '1536': { quality: 85, progressive: true, optimize: true }
    }
  };

  private static lazyLoadingConfig: ImageLazyLoadingConfig = {
    enabled: true,
    threshold: 0,
    rootMargin: '50px 0px',
    placeholderType: 'blur',
    loadingStrategy: 'auto'
  };

  // Main optimization function
  static async optimizeImageForSEO(
    imagePath: string,
    altText: string,
    targetKeywords: RomanianKeyword[],
    imageContext: ImageContext
  ): Promise<ImageSEOData> {
    
    // Generate optimized image paths
    const optimizedPaths = await this.generateOptimizedImages(imagePath, imageContext);
    
    // Generate SEO-optimized alt text
    const seoAltText = this.generateSEOAltText(altText, targetKeywords, imageContext);
    
    // Generate title and caption
    const titleText = this.generateImageTitle(altText, imageContext);
    const caption = this.generateImageCaption(altText, imageContext);
    
    // Generate structured data
    const structuredData = this.generateImageStructuredData(
      imagePath,
      optimizedPaths,
      altText,
      caption,
      imageContext
    );
    
    // Calculate SEO score
    const seoScore = this.calculateImageSEOScore(seoAltText, structuredData, optimizedPaths);
    
    // Generate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(imagePath, optimizedPaths);
    
    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(
      seoAltText,
      structuredData,
      optimizedPaths,
      performanceMetrics
    );

    return {
      originalPath: imagePath,
      optimizedPaths,
      altText: seoAltText,
      titleText,
      caption,
      structuredData,
      seoScore,
      performanceMetrics,
      recommendations
    };
  }

  // Generate multiple optimized versions of an image
  private static async generateOptimizedImages(
    originalPath: string,
    context: ImageContext
  ): Promise<OptimizedImagePath[]> {
    const optimizedPaths: OptimizedImagePath[] = [];
    
    // Generate different formats and sizes
    for (const format of this.config.targetFormats) {
      for (const breakpoint of this.responsiveConfig.breakpoints) {
        const quality = this.responsiveConfig.qualitySettings[breakpoint.toString()]?.quality || 70;
        
        const optimizedPath = await this.optimizeImageForFormat(
          originalPath,
          format,
          breakpoint,
          quality
        );
        
        if (optimizedPath) {
          optimizedPaths.push(optimizedPath);
        }
      }
    }
    
    return optimizedPaths.sort((a, b) => a.size - b.size);
  }

  // Optimize image for specific format and size
  private static async optimizeImageForFormat(
    originalPath: string,
    format: string,
    targetWidth: number,
    quality: number
  ): Promise<OptimizedImagePath | null> {
    // In real implementation, this would use sharp or similar library
    const filename = this.generateOptimizedFilename(originalPath, format, targetWidth, quality);
    const fileSize = Math.floor(Math.random() * 500000) + 50000; // Mock file size
    
    return {
      format,
      path: `/optimized/${filename}`,
      size: fileSize,
      dimensions: {
        width: targetWidth,
        height: Math.floor(targetWidth * 0.75) // Mock aspect ratio
      },
      quality: quality.toString(),
      url: `/optimized/${filename}`
    };
  }

  // Generate SEO-optimized alt text
  private static generateSEOAltText(
    originalAlt: string,
    keywords: RomanianKeyword[],
    context: ImageContext
  ): string {
    let optimizedAlt = originalAlt;
    
    // Add primary keyword if not present
    if (context.primaryKeyword && !optimizedAlt.toLowerCase().includes(context.primaryKeyword.keyword.toLowerCase())) {
      optimizedAlt += ` ${context.primaryKeyword.keyword}`;
    }
    
    // Add context-specific terms
    if (context.productCategory) {
      optimizedAlt += ` ${context.productCategory}`;
    }
    
    if (context.brand) {
      optimizedAlt += ` ${context.brand}`;
    }
    
    // Add location for local SEO
    if (context.location) {
      optimizedAlt += ` în ${context.location}`;
    }
    
    // Ensure alt text is within optimal length (50-125 characters)
    if (optimizedAlt.length > 125) {
      optimizedAlt = optimizedAlt.substring(0, 122) + '...';
    } else if (optimizedAlt.length < 50 && context.description) {
      optimizedAlt += ` ${context.description}`.substring(0, 125 - optimizedAlt.length);
    }
    
    return optimizedAlt;
  }

  // Generate image title
  private static generateImageTitle(altText: string, context: ImageContext): string {
    let title = altText;
    
    // Add context-specific elements
    if (context.imageType === 'product') {
      title = `Fotografie produs: ${altText}`;
    } else if (context.imageType === 'category') {
      title = `Imagine categorie: ${altText}`;
    } else if (context.imageType === 'blog') {
      title = `Imagine articol: ${altText}`;
    }
    
    // Add location for local SEO
    if (context.location) {
      title += ` - ${context.location}`;
    }
    
    return title;
  }

  // Generate image caption
  private static generateImageCaption(altText: string, context: ImageContext): string {
    let caption = `Imagine ${altText.toLowerCase()}`;
    
    // Add context-specific information
    if (context.productCategory) {
      caption += ` din categoria ${context.productCategory}`;
    }
    
    if (context.location) {
      caption += ` realizată în ${context.location}`;
    }
    
    // Add quality attributes
    caption += ` - calitate superioară, optimizată pentru web`;
    
    return caption;
  }

  // Generate structured data for image
  private static generateImageStructuredData(
    originalPath: string,
    optimizedPaths: OptimizedImagePath[],
    altText: string,
    caption: string,
    context: ImageContext
  ): ImageStructuredData {
    const mainImage = optimizedPaths.find(p => p.format === 'webp') || optimizedPaths[0];
    
    return {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      contentUrl: mainImage?.url || originalPath,
      url: mainImage?.url || originalPath,
      width: mainImage?.dimensions.width || 800,
      height: mainImage?.dimensions.height || 600,
      encodingFormat: mainImage?.format || 'jpeg',
      caption,
      description: altText,
      name: altText,
      author: {
        "@type": "Organization",
        name: "Piata AI RO"
      },
      copyrightHolder: {
        "@type": "Organization",
        name: "Piata AI RO"
      },
      creditText: "Piata AI RO",
      keywords: context.keywords?.map(k => k.keyword) || [],
      locationCreated: context.location ? {
        "@type": "Place",
        name: context.location
      } : undefined
    };
  }

  // Calculate image SEO score
  private static calculateImageSEOScore(
    altText: string,
    structuredData: ImageStructuredData,
    optimizedPaths: OptimizedImagePath[]
  ): number {
    let score = 0;
    
    // Alt text optimization (30 points)
    if (altText.length >= 50 && altText.length <= 125) score += 15;
    if (altText.length >= 25 && altText.length < 50) score += 10;
    if (altText.length > 125) score += 5;
    
    // Keywords in alt text (20 points)
    if (structuredData.keywords && structuredData.keywords.length > 0) score += 20;
    
    // Structured data completeness (25 points)
    if (structuredData.caption) score += 5;
    if (structuredData.description) score += 5;
    if (structuredData.author) score += 5;
    if (structuredData.locationCreated) score += 5;
    if (structuredData.keywords) score += 5;
    
    // Image optimization (25 points)
    const hasWebP = optimizedPaths.some(p => p.format === 'webp');
    const hasAVIF = optimizedPaths.some(p => p.format === 'avif');
    const multipleSizes = optimizedPaths.length >= 3;
    
    if (hasWebP) score += 10;
    if (hasAVIF) score += 10;
    if (multipleSizes) score += 5;
    
    return Math.min(100, score);
  }

  // Calculate performance metrics
  private static calculatePerformanceMetrics(
    originalPath: string,
    optimizedPaths: OptimizedImagePath[]
  ): ImagePerformanceMetrics {
    const originalSize = 1024 * 1024; // Mock original size (1MB)
    const smallestOptimized = Math.min(...optimizedPaths.map(p => p.size));
    const largestOptimized = Math.max(...optimizedPaths.map(p => p.size));
    
    const compressionRatio = (originalSize - smallestOptimized) / originalSize;
    const bandwidthSavings = originalSize - largestOptimized;
    const loadTime = smallestOptimized / (1024 * 1024) * 1000; // Mock calculation
    
    return {
      loadTime,
      fileSize: smallestOptimized,
      compressionRatio,
      lcpImpact: compressionRatio > 0.7 ? 'low' : compressionRatio > 0.5 ? 'medium' : 'high',
      bandwidthSavings,
      userExperienceScore: Math.min(100, (compressionRatio * 100) + 20)
    };
  }

  // Generate optimization recommendations
  private static generateOptimizationRecommendations(
    altText: string,
    structuredData: ImageStructuredData,
    optimizedPaths: OptimizedImagePath[],
    metrics: ImagePerformanceMetrics
  ): ImageOptimizationRecommendation[] {
    const recommendations: ImageOptimizationRecommendation[] = [];
    
    // Alt text recommendations
    if (altText.length < 50) {
      recommendations.push({
        type: 'alt-text',
        priority: 'high',
        title: 'Îmbunătățește textul alternativ',
        description: 'Textul alternativ este prea scurt pentru SEO optim.',
        action: 'Adaugă descrierea detaliată a imaginii (50-125 caractere)',
        impact: 'high'
      });
    }
    
    if (altText.length > 125) {
      recommendations.push({
        type: 'alt-text',
        priority: 'medium',
        title: 'Scurtează textul alternativ',
        description: 'Textul alternativ este prea lung și poate fi trunchiat.',
        action: 'Scurtează la maximum 125 caractere',
        impact: 'medium'
      });
    }
    
    // Format recommendations
    if (!optimizedPaths.some(p => p.format === 'webp')) {
      recommendations.push({
        type: 'format',
        priority: 'high',
        title: 'Adaugă format WebP',
        description: 'Formatul WebP oferă compresie superioară.',
        action: 'Generează versiune WebP pentru toate imaginile',
        impact: 'high'
      });
    }
    
    // Structured data recommendations
    if (!structuredData.keywords || structuredData.keywords.length === 0) {
      recommendations.push({
        type: 'structured-data',
        priority: 'medium',
        title: 'Adaugă cuvinte cheie în structured data',
        description: 'Structured data fără cuvinte cheie pierde oportunități SEO.',
        action: 'Include cuvinte cheie relevante în structured data',
        impact: 'medium'
      });
    }
    
    // Performance recommendations
    if (metrics.compressionRatio < 0.5) {
      recommendations.push({
        type: 'compression',
        priority: 'high',
        title: 'Îmbunătățește compresia',
        description: 'Rata de compresie este prea mică.',
        action: 'Setează o calitate mai mică pentru imagini',
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  // Generate responsive image markup
  static generateResponsiveImageMarkup(imageData: ImageSEOData): string {
    const webpImages = imageData.optimizedPaths.filter(p => p.format === 'webp');
    const jpegImages = imageData.optimizedPaths.filter(p => p.format === 'jpeg');
    
    let markup = `<img\n`;
    markup += `  src="${webpImages[0]?.url || jpegImages[0]?.url}"\n`;
    markup += `  alt="${imageData.altText}"\n`;
    markup += `  title="${imageData.titleText}"\n`;
    
    if (this.lazyLoadingConfig.enabled) {
      markup += `  loading="${this.lazyLoadingConfig.loadingStrategy}"\n`;
      markup += `  data-src="${webpImages[0]?.url || jpegImages[0]?.url}"\n`;
    }
    
    // Add srcset for responsive images
    if (webpImages.length > 1) {
      const srcset = webpImages.map(img => `${img.url} ${img.dimensions.width}w`).join(', ');
      markup += `  srcset="${srcset}"\n`;
      markup += `  sizes="(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1280px) 1280px, 1280px"\n`;
    }
    
    markup += `  decoding="async"\n`;
    markup += `  style="width: 100%; height: auto;"\n`;
    markup += `/>`;
    
    return markup;
  }

  // Generate lazy loading implementation
  static generateLazyLoadingScript(): string {
    return `
<script>
// Lazy loading implementation
if ('loading' in HTMLImageElement.prototype) {
  // Browser supports native lazy loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.src = img.dataset.src || img.src;
  });
} else {
  // Fallback for browsers without native lazy loading
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imageObserver.observe(img);
  });
}
</script>
`;
  }

  // Generate optimized filename
  private static generateOptimizedFilename(
    originalPath: string,
    format: string,
    width: number,
    quality: number
  ): string {
    const originalName = originalPath.split('/').pop()?.split('.')[0] || 'image';
    return `${originalName}-${width}w-${quality}q.${format}`;
  }

  // Batch optimize images
  static async batchOptimizeImages(
    images: Array<{
      path: string;
      altText: string;
      keywords: RomanianKeyword[];
      context: ImageContext;
    }>
  ): Promise<ImageSEOData[]> {
    const results: ImageSEOData[] = [];
    
    for (const image of images) {
      try {
        const optimizedData = await this.optimizeImageForSEO(
          image.path,
          image.altText,
          image.keywords,
          image.context
        );
        results.push(optimizedData);
      } catch (error) {
        console.error(`Failed to optimize image ${image.path}:`, error);
      }
    }
    
    return results;
  }

  // Generate image sitemap entries
  static generateImageSitemapEntries(imageDataList: ImageSEOData[]): string {
    const entries = imageDataList.map(data => {
      const mainImage = data.optimizedPaths[0];
      return `
  <url>
    <loc>https://piata-ai.ro/images/${data.originalPath}</loc>
    <image:image>
      <image:loc>https://piata-ai.ro${mainImage?.url}</image:loc>
      <image:title>${data.titleText}</image:title>
      <image:caption>${data.caption}</image:caption>
      <image:geo_location>Romania</image:geo_location>
    </image:image>
  </url>`;
    }).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;
  }
}

// Interface definitions
export interface ImageContext {
  primaryKeyword?: RomanianKeyword;
  keywords?: RomanianKeyword[];
  productCategory?: string;
  brand?: string;
  location?: string;
  imageType: 'product' | 'category' | 'blog' | 'banner' | 'profile';
  description?: string;
  isUserGenerated?: boolean;
}

export interface ImageBatchOptimizationResult {
  totalImages: number;
  successful: number;
  failed: number;
  averageSEOScore: number;
  totalBandwidthSavings: number;
  recommendations: ImageOptimizationRecommendation[];
}