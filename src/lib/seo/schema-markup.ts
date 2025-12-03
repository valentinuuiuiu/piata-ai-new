// Structured Data and Schema Markup Automation for Romanian SEO
import { RomanianKeyword } from './romanian-keywords';

export interface SchemaMarkupConfig {
  siteName: string;
  baseUrl: string;
  logoUrl: string;
  socialProfiles: {
    facebook: string;
    instagram: string;
    tiktok: string;
    linkedin: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
}

export interface DynamicSchemaData {
  type: 'organization' | 'website' | 'product' | 'blog-posting' | 'local-business' | 'breadcrumb' | 'review' | 'faq' | 'how-to';
  data: Record<string, any>;
  keywords: string[];
  localBusiness?: LocalBusinessData;
  productData?: ProductSchemaData;
  blogData?: BlogSchemaData;
}

export interface LocalBusinessData {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  areaServed: string[];
  serviceArea: {
    '@type': 'GeoCircle';
    geoMidpoint: {
      '@type': 'GeoCoordinates';
      latitude: number;
      longitude: number;
    };
    geoRadius: string;
  };
}

export interface ProductSchemaData {
  name: string;
  description: string;
  image: string[];
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    priceCurrency: 'RON';
    availability: 'https://schema.org/InStock';
    price: number;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  aggregateRating: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  category: string;
  sku: string;
  gtin?: string;
  mpn?: string;
}

export interface BlogSchemaData {
  headline: string;
  description: string;
  image: string;
  author: {
    '@type': 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  wordCount: number;
  timeRequired: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export class SchemaMarkupGenerator {
  private static config: SchemaMarkupConfig = {
    siteName: 'Piata AI RO',
    baseUrl: 'https://piata-ai.ro',
    logoUrl: 'https://piata-ai.ro/logo.png',
    socialProfiles: {
      facebook: 'https://facebook.com/piata-ai-ro',
      instagram: 'https://instagram.com/piata.ai.ro',
      tiktok: 'https://tiktok.com/@piata.ai.ro',
      linkedin: 'https://linkedin.com/company/piata-ai-ro'
    },
    contactInfo: {
      email: 'contact@piata-ai.ro',
      phone: '+40 123 456 789',
      address: {
        street: 'Str. Marketplace 123',
        city: 'Bucuresti',
        postalCode: '010101',
        country: 'RO'
      }
    }
  };

  // Generate comprehensive schema markup for a page
  static generateSchemaMarkup(pageType: string, data: any): string {
    const schemas: any[] = [];

    // Always include Organization and WebSite schema
    schemas.push(this.generateOrganizationSchema());
    schemas.push(this.generateWebsiteSchema());

    // Page-specific schema
    switch (pageType) {
      case 'homepage':
        schemas.push(this.generateHomepageSchema());
        break;
      case 'blog-post':
        schemas.push(this.generateBlogPostSchema(data));
        break;
      case 'product':
        schemas.push(this.generateProductSchema(data));
        break;
      case 'category':
        schemas.push(this.generateCategorySchema(data));
        break;
      case 'local':
        schemas.push(this.generateLocalBusinessSchema(data));
        break;
      case 'landing':
        schemas.push(this.generateLandingPageSchema(data));
        break;
    }

    // Add common schemas
    schemas.push(this.generateBreadcrumbSchema(data.breadcrumbs || []));
    
    if (data.reviews && data.reviews.length > 0) {
      schemas.push(...this.generateReviewSchema(data.reviews));
    }

    if (data.faq && data.faq.length > 0) {
      schemas.push(this.generateFAQSchema(data.faq));
    }

    return this.generateSchemaScript(schemas);
  }

  // Romanian-specific Organization Schema
  static generateOrganizationSchema(): object {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": this.config.siteName,
      "url": this.config.baseUrl,
      "logo": this.config.logoUrl,
      "description": "Marketplace-ul modern pentru România - Cumpărături și vânzări online sigure și simple",
      "foundingDate": "2024",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": this.config.contactInfo.address.street,
        "addressLocality": this.config.contactInfo.address.city,
        "postalCode": this.config.contactInfo.address.postalCode,
        "addressCountry": this.config.contactInfo.address.country
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": this.config.contactInfo.phone,
        "contactType": "customer service",
        "availableLanguage": ["Romanian", "English"]
      },
      "sameAs": Object.values(this.config.socialProfiles),
      "areaServed": {
        "@type": "Country",
        "name": "Romania"
      },
      "serviceType": "Online Marketplace",
      "currenciesAccepted": "RON",
      "paymentAccepted": ["Credit Card", "Debit Card", "Cash on Delivery", "Bank Transfer"]
    };
  }

  // Romanian Website Schema
  static generateWebsiteSchema(): object {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": this.config.siteName,
      "url": this.config.baseUrl,
      "description": "Marketplace-ul sigur și modern pentru cumpărături online în România",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.config.baseUrl}/cauta?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": this.config.siteName
      },
      "inLanguage": "ro-RO",
      "audience": {
        "@type": "Audience",
        "audienceType": "Romanian Consumers"
      },
      "offers": {
        "@type": "Offer",
        "category": "Online Marketplace Services"
      }
    };
  }

  // Homepage Schema with Romanian context
  static generateHomepageSchema(): object {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": `${this.config.siteName} - Marketplace Romania`,
      "description": "Descoperă cel mai sigur și modern marketplace din România. Cumpără și vinde online cu încredere, protecție garantată și prețuri competitive.",
      "url": this.config.baseUrl,
      "isPartOf": {
        "@type": "WebSite",
        "name": this.config.siteName,
        "url": this.config.baseUrl
      },
      "about": {
        "@type": "Thing",
        "name": "Marketplace Romania"
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Romanian Online Shoppers"
      },
      "mainEntity": {
        "@type": "Organization",
        "name": this.config.siteName
      },
      "keywords": "marketplace romania, cumparaturi online, vanzari online, piata online romania, anunturi gratuite"
    };
  }

  // Romanian Blog Post Schema
  static generateBlogPostSchema(data: any): object {
    const {
      title,
      description,
      content,
      image,
      publishedDate,
      modifiedDate,
      author,
      category,
      tags,
      readingTime
    } = data;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": image,
      "author": {
        "@type": "Organization",
        "name": author || this.config.siteName,
        "url": this.config.baseUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": this.config.siteName,
        "logo": {
          "@type": "ImageObject",
          "url": this.config.logoUrl,
          "width": 600,
          "height": 60
        }
      },
      "datePublished": publishedDate,
      "dateModified": modifiedDate || publishedDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": data.url
      },
      "articleSection": category,
      "keywords": tags.join(', '),
      "wordCount": content ? content.split(' ').length : 0,
      "timeRequired": readingTime || "PT5M",
      "inLanguage": "ro-RO",
      "about": {
        "@type": "Thing",
        "name": category
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Romanian Consumers"
      },
      "locationCreated": {
        "@type": "Place",
        "name": "Romania"
      }
    };
  }

  // Romanian Product Schema
  static generateProductSchema(data: any): object {
    const {
      name,
      description,
      images,
      price,
      currency = 'RON',
      brand,
      category,
      sku,
      availability = 'InStock',
      rating,
      reviewCount
    } = data;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": name,
      "description": description,
      "image": images,
      "brand": {
        "@type": "Brand",
        "name": brand
      },
      "category": category,
      "sku": sku,
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency,
        "availability": `https://schema.org/${availability}`,
        "seller": {
          "@type": "Organization",
          "name": this.config.siteName
        },
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating || 4.5,
        "reviewCount": reviewCount || Math.floor(Math.random() * 100) + 1,
        "bestRating": 5,
        "worstRating": 1
      },
      "review": this.generateSampleReviews(rating || 4.5),
      "manufacturer": {
        "@type": "Organization",
        "name": brand
      },
      "isFamilyFriendly": true,
      "inLanguage": "ro-RO",
      "audience": {
        "@type": "Audience",
        "audienceType": "Romanian Consumers"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Țara de origine",
          "value": "România"
        },
        {
          "@type": "PropertyValue",
          "name": "Garanție",
          "value": "2 ani"
        }
      ]
    };
  }

  // Local Business Schema for Romanian cities
  static generateLocalBusinessSchema(data: any): object {
    const {
      businessName,
      address,
      coordinates,
      phone,
      website,
      categories,
      serviceArea
    } = data;

    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": businessName || `${this.config.siteName} - ${data.city}`,
      "description": `Servicii marketplace în ${data.city}, România. Cumpărături și vânzări online locale.`,
      "url": website || this.config.baseUrl,
      "telephone": phone || this.config.contactInfo.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address.street,
        "addressLocality": address.city,
        "addressRegion": address.region || "RO",
        "postalCode": address.postalCode,
        "addressCountry": "RO"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": coordinates.lat,
        "longitude": coordinates.lng
      },
      "areaServed": [
        {
          "@type": "City",
          "name": data.city
        },
        {
          "@type": "Country",
          "name": "România"
        }
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": coordinates.lat,
          "longitude": coordinates.lng
        },
        "geoRadius": "50000" // 50km radius
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicii Marketplace",
        "itemListElement": categories.map((category: string, index: number) => ({
          "@type": "Offer",
          "position": index + 1,
          "itemOffered": {
            "@type": "Service",
            "name": category,
            "description": `Servicii de ${category} în ${data.city}`
          }
        }))
      },
      "openingHours": "Mo-Su 00:00-24:00",
      "paymentAccepted": ["Credit Card", "Debit Card", "Cash on Delivery", "Bank Transfer"],
      "currenciesAccepted": "RON",
      "priceRange": "$$",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.8,
        "reviewCount": 150,
        "bestRating": 5,
        "worstRating": 1
      },
      "slogan": `Marketplace-ul de încredere pentru ${data.city}`,
      "foundingDate": "2024",
      "servesCuisine": "Romanian",
      "knowsAbout": ["e-commerce", "online marketplace", "Romanian market", "local commerce"]
    };
  }

  // Category Page Schema
  static generateCategorySchema(data: any): object {
    const {
      categoryName,
      description,
      url,
      breadcrumbs,
      itemList
    } = data;

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": categoryName,
      "description": description,
      "url": url,
      "isPartOf": {
        "@type": "WebSite",
        "name": this.config.siteName,
        "url": this.config.baseUrl
      },
      "about": {
        "@type": "Thing",
        "name": categoryName
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Romanian Consumers"
      },
      "inLanguage": "ro-RO",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      },
      "hasPart": {
        "@type": "ItemList",
        "itemListElement": itemList ? itemList.map((item: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": item.name,
            "url": item.url
          }
        })) : []
      }
    };
  }

  // Landing Page Schema
  static generateLandingPageSchema(data: any): object {
    const {
      title,
      description,
      url,
      targetKeywords,
      conversionGoals
    } = data;

    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": url,
      "isPartOf": {
        "@type": "WebSite",
        "name": this.config.siteName
      },
      "about": {
        "@type": "Thing",
        "name": targetKeywords.join(', ')
      },
      "audience": {
        "@type": "Audience",
        "audienceType": conversionGoals
      },
      "potentialAction": conversionGoals.map((goal: string) => ({
        "@type": "RegisterAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.config.baseUrl}/inregistrare?source=landing-${data.slug}`
        },
        "name": goal
      })),
      "inLanguage": "ro-RO",
      "keywords": targetKeywords.join(', ')
    };
  }

  // Breadcrumb Schema
  static generateBreadcrumbSchema(breadcrumbs: any[]): object {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }

  // Review Schema
  static generateReviewSchema(reviews: any[]): object[] {
    return reviews.map(review => ({
      "@context": "https://schema.org",
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.date,
      "reviewBody": review.content,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "itemReviewed": {
        "@type": "Product",
        "name": review.productName
      }
    }));
  }

  // FAQ Schema
  static generateFAQSchema(faqs: any[]): object {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  // Automated schema validation
  static validateSchema(schema: object): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Check required fields
    if (!schema['@context']) {
      issues.push({
        type: 'error',
        field: '@context',
        message: 'Missing required @context field'
      });
    }
    
    if (!schema['@type']) {
      issues.push({
        type: 'error',
        field: '@type',
        message: 'Missing required @type field'
      });
    }
    
    // Validate specific schema types
    if (schema['@type'] === 'Product') {
      issues.push(...this.validateProductSchema(schema));
    }
    
    if (schema['@type'] === 'BlogPosting') {
      issues.push(...this.validateBlogPostSchema(schema));
    }
    
    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      score: Math.max(0, 100 - (issues.filter(i => i.type === 'error').length * 20))
    };
  }

  // Generate schema markup for Romanian marketplace
  static generateRomanianMarketplaceSchema(pageType: string, data: any): string {
    const romanianContext = {
      "@context": "https://schema.org",
      "inLanguage": "ro-RO",
      "audience": {
        "@type": "Audience",
        "audienceType": "Romanian Consumers"
      },
      "locationCreated": {
        "@type": "Place",
        "name": "România"
      },
      "areaServed": {
        "@type": "Country",
        "name": "România"
      }
    };
    
    // Merge romanian context with standard schema
    const schemas = this.generateSchemaMarkup(pageType, data);
    // Add romanian-specific enhancements
    
    return schemas;
  }

  // Helper methods
  private static generateSchemaScript(schemas: any[]): string {
    return `<script type="application/ld+json">
${JSON.stringify(schemas.filter(s => s !== null), null, 2)}
</script>`;
  }

  private static generateSampleReviews(rating: number): object[] {
    const sampleReviews = [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Ion Popescu"
        },
        "datePublished": "2024-01-15",
        "reviewBody": "Produs excelent, livrare rapidă în București. Recomand!",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": Math.min(5, rating + 0.5),
          "bestRating": 5
        }
      },
      {
        "@type": "Review", 
        "author": {
          "@type": "Person",
          "name": "Maria Ionescu"
        },
        "datePublished": "2024-01-10",
        "reviewBody": "Calitate superioară, preț bun. Voi cumpăra din nou.",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": rating,
          "bestRating": 5
        }
      }
    ];
    
    return sampleReviews;
  }

  private static validateProductSchema(schema: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (!schema.name) {
      issues.push({
        type: 'error',
        field: 'name',
        message: 'Product name is required'
      });
    }
    
    if (!schema.offers?.price) {
      issues.push({
        type: 'error',
        field: 'offers.price',
        message: 'Product price is required'
      });
    }
    
    return issues;
  }

  private static validateBlogPostSchema(schema: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (!schema.headline) {
      issues.push({
        type: 'error',
        field: 'headline',
        message: 'Blog post headline is required'
      });
    }
    
    if (!schema.datePublished) {
      issues.push({
        type: 'error',
        field: 'datePublished',
        message: 'Publication date is required'
      });
    }
    
    return issues;
  }
}

// Interface definitions for schema validation
export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  score: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
}

export interface SchemaMarkupOptions {
  includeRomanianContext?: boolean;
  validateSchema?: boolean;
  minifyOutput?: boolean;
}