// AI-Powered Content Generation Pipeline for Romanian SEO
import { RomanianKeyword, ROMANIAN_KEYWORDS, SEO_UTILS } from './romanian-keywords';

export interface ContentGenerationRequest {
  keyword: string;
  contentType: 'blog' | 'product' | 'landing' | 'social' | 'category';
  targetCity?: string;
  competitor?: string;
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
  length?: 'short' | 'medium' | 'long';
  includeSEO?: boolean;
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  structuredData?: object;
  slug: string;
  h1: string;
  metaKeywords: string;
}

function generateSlug(title: string): string {
  return title
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

export class AIContentGenerator {
  private static readonly CONTENT_TEMPLATES = {
    blog: {
      structure: {
        introduction: "Introducerea trebuie să capteze atenția și să prezinte problema/soluția",
        body: "Corpul articolului cu beneficii, comparații și exemple concrete",
        conclusion: "Concluzia cu call-to-action clar"
      },
      wordCounts: {
        short: 800,
        medium: 1500,
        long: 2500
      }
    },
    product: {
      structure: {
        title: "Titlu optimizat pentru produs",
        description: "Descriere detaliată cu beneficii",
        features: "Caracteristici principale",
        specifications: "Specificații tehnice"
      },
      wordCounts: {
        short: 300,
        medium: 600,
        long: 1000
      }
    },
    landing: {
      structure: {
        headline: "Headline puternic și clar",
        value: "Propunerea de valoare",
        benefits: "Lista beneficiilor",
        cta: "Call-to-action"
      },
      wordCounts: {
        short: 500,
        medium: 1000,
        long: 1500
      }
    }
  };

  static async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const keywordData = ROMANIAN_KEYWORDS.find(k => k.keyword === request.keyword);
    if (!keywordData) {
      throw new Error(`Keyword ${request.keyword} not found in database`);
    }

    const template = this.CONTENT_TEMPLATES[request.contentType];
    const wordCount = template.wordCounts[request.length || 'medium'];

    switch (request.contentType) {
      case 'blog':
        return this.generateBlogPost(keywordData, wordCount, request);
      case 'product':
        return this.generateProductContent(keywordData, wordCount, request);
      case 'landing':
        return this.generateLandingPage(keywordData, wordCount, request);
      case 'social':
        return this.generateSocialContent(keywordData, request);
      default:
        throw new Error(`Unsupported content type: ${request.contentType}`);
    }
  }

  private static async generateBlogPost(
    keyword: RomanianKeyword,
    wordCount: number,
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    const titleTemplates = {
      competitor: [
        `De ce să alegi ${keyword.keyword} în 2024: Ghid complet`,
        `${keyword.keyword} vs OLX: Analiză detaliată și comparație`,
        `Cum ${keyword.keyword} revoluționează cumpărăturile online în România`
      ],
      local: [
        `Cum să vinzi online în ${keyword.keyword} - Ghid pentru începători`,
        `Tot ce trebuie să știi despre ${keyword.keyword}`,
        `${keyword.keyword}: Soluția modernă pentru cumpărături locale`
      ],
      products: [
        `Cele mai bune oferte pentru ${keyword.keyword} în 2024`,
        `Ghidul complet pentru ${keyword.keyword}: Sfaturi și recomandări`,
        `Cum să alegi cel mai bun ${keyword.keyword} - Analiză detaliată`
      ],
      primary: [
        `Ghidul complet pentru ${keyword.keyword}`,
        `Tot ce trebuie să știi despre ${keyword.keyword}`,
        `${keyword.keyword}: Viitorul cumpărăturilor online în România`
      ]
    };

    const categoryTitles = titleTemplates[request.competitor as keyof typeof titleTemplates] || titleTemplates.primary;
    const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];

    const h1 = title;
    const slug = generateSlug(title);
    const metaDescription = (AIContentGenerator as any).generateMetaDescription(keyword, title);

    const content = await (AIContentGenerator as any).generateBlogContent(keyword, title, wordCount, request);

    const keywords = AIContentGenerator.extractKeywords(content, keyword);

    return {
      title,
      metaDescription,
      content,
      keywords,
      structuredData: (AIContentGenerator as any).generateBlogStructuredData(keyword, title, content),
      slug,
      h1,
      metaKeywords: keywords.slice(0, 10).join(', ')
    };
  }

  private static async generateProductContent(
    keyword: RomanianKeyword,
    wordCount: number,
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    const title = `Produse ${keyword.keyword} - Calitate Premium la Prețuri Imbătibile`;
    const h1 = title;
    const slug = generateSlug(`produse-${keyword.keyword}`);
    const metaDescription = `Descoperă cea mai mare selecție de ${keyword.keyword} la cele mai bune prețuri. Calitate garantată, livrare rapidă în toată România.`;

    const content = (AIContentGenerator as any).generateProductContentStructure(keyword, wordCount);
    const keywords = [`${keyword.keyword}`, `cumparaturi online`, `romania`, `piata online`];

    return {
      title,
      metaDescription,
      content,
      keywords,
      structuredData: (AIContentGenerator as any).generateProductStructuredData(keyword, title),
      slug,
      h1,
      metaKeywords: keywords.join(', ')
    };
  }

  private static async generateLandingPage(
    keyword: RomanianKeyword,
    wordCount: number,
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    const title = keyword.competitor 
      ? `Înlocuiește ${keyword.competitor.toUpperCase()} cu soluția noastră superioră`
      : `${keyword.keyword} - Marketplace-ul modern pentru România`;
    
    const h1 = title;
    const slug = generateSlug(keyword.keyword);
    const metaDescription = `Descoperă ${keyword.keyword}. Marketplace-ul sigur și modern pentru cumpărături și vânzări online în România.`;

    const content = (AIContentGenerator as any).generateLandingContent(keyword, wordCount, request);
    const keywords = (AIContentGenerator as any).generateLandingKeywords(keyword);

    return {
      title,
      metaDescription,
      content,
      keywords,
      structuredData: (AIContentGenerator as any).generateLandingStructuredData(keyword, title),
      slug,
      h1,
      metaKeywords: keywords.slice(0, 10).join(', ')
    };
  }

  private static async generateSocialContent(
    keyword: RomanianKeyword,
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    const title = `Postare socială pentru ${keyword.keyword}`;
    const h1 = title;
    const slug = generateSlug(`social-${keyword.keyword}`);
    const metaDescription = `Conținut social media optimizat pentru ${keyword.keyword}`;

    const content = (AIContentGenerator as any).generateSocialContentStructure(keyword);
    const keywords = [`${keyword.keyword}`, 'social media', 'romania'];

    return {
      title,
      metaDescription,
      content,
      keywords,
      slug,
      h1,
      metaKeywords: keywords.join(', ')
    };
  }

  static generateBlogContent(keyword: RomanianKeyword, title: string, wordCount: number, request: ContentGenerationRequest): string {
    const sections = [];
    
    // Introduction
    sections.push(`## ${title.split(':')[0]}`);
    sections.push(AIContentGenerator.generateIntroduction(keyword, request));
    
    // Main content sections
    const mainPoints = AIContentGenerator.generateMainPoints(keyword, request);
    sections.push(...mainPoints);
    
    // Benefits section
    sections.push(AIContentGenerator.generateBenefitsSection(keyword));
    
    // Comparison section (if competitor)
    if (keyword.competitor) {
      sections.push(AIContentGenerator.generateComparisonSection(keyword));
    }
    
    // Local section (if city-specific)
    if (keyword.city) {
      sections.push(AIContentGenerator.generateLocalSection(keyword));
    }
    
    // Conclusion
    sections.push(AIContentGenerator.generateConclusion(keyword));

    return sections.join('\n\n');
  }

  static generateIntroduction(keyword: RomanianKeyword, request: ContentGenerationRequest): string {
    const introTemplates = {
      competitor: `În peisajul actual al pieței online din România, ${keyword.keyword} se remarcă prin caracteristicile sale unice și avantajele competitive. În acest articol, vom explora de ce tot mai mulți români aleg această soluție în detrimentul alternativelor tradiționale.`,
      local: `${keyword.city ? `În ${keyword.city}` : 'În România'}, piața online cunoaște o evoluție constantă, iar ${keyword.keyword} devine din ce în ce mai popular printre consumatori. Să descoperim împreună toate avantajele acestei soluții.`,
      products: `Domeniul ${keyword.keyword} din România se află într-o transformare accelerată. Consumatorii caută soluții mai bune, mai sigure și mai convenabile. ${keyword.keyword} răspunde acestor nevoi printr-o abordare inovatoare.`,
      primary: `${keyword.keyword} reprezintă viitorul cumpărăturilor online în România. Cu o creștere constantă a adopției digitale și o cerere în creștere pentru soluții de piață online, această platformă se disting prin caracteristicile sale inovatoare.`
    };

    const template = introTemplates[request.competitor as keyof typeof introTemplates] || introTemplates.primary;
    return template;
  }

  static generateMainPoints(keyword: RomanianKeyword, request: ContentGenerationRequest): string[] {
    const points = [];

    if (keyword.competitor) {
      points.push(`### De ce ${keyword.keyword} este superior concurenței`);
      points.push(`Spre deosebire de ${keyword.competitor.toUpperCase()}, ${keyword.keyword} oferă:`);
      points.push(`- Comisioane mai mici pentru vânzători`);
      points.push(`- Securitate sporită cu sistem escrow integrat`);
      points.push(`- Interfață intuitivă optimizată pentru mobile`);
      points.push(`- Suport clienți disponibil 24/7`);
      points.push('');
    }

    points.push(`### Beneficiile pentru cumpărători`);
    points.push(`Când alegi ${keyword.keyword}, beneficiezi de:`);
    points.push(`- Produse verificate și de calitate`);
    points.push(`- Sistem de recenzii autentic`);
    points.push(`- Protecția cumpărătorului garantată`);
    points.push(`- Livrare rapidă în toată țara`);
    points.push(`- Plata ramburs disponibilă`);
    points.push('');

    return points;
  }

  static generateBenefitsSection(keyword: RomanianKeyword): string {
    return `### Avantajele distinctive ale ${keyword.keyword}

**Pentru cumpărători:**
- Selecție vastă de produse verificate
- Prețuri competitive direct de la producători
- Retur gratuit în 30 de zile
- Suport clienți dedicat

**Pentru vânzători:**
- Comisioane transparente (max 5%)
- Instrumente de marketing avansate
- Analytics detaliat pentru vânzări
- Program de fidelizare pentru vânzători activi

**Pentru ambele:**
- Platformă sigură cu criptare end-to-end
- Community moderat și de încredere
- Aplicație mobilă optimizată`;
  }

  static generateComparisonSection(keyword: RomanianKeyword): string {
    if (!keyword.competitor) return '';

    return `### ${keyword.keyword} vs ${keyword.competitor.toUpperCase()} - Analiză detaliată

| Caracteristică | ${keyword.keyword} | ${keyword.competitor.toUpperCase()} |
|---|---|---|
| Comisioane vânzători | 3-5% | 5-10% |
| Plata ramburs | ✅ Da | ⚠️ Limitat |
| Aplicație mobilă | ✅ Optimizată | ⚠️ Bază |
| Suport clienți | 24/7 | Oră de lucru |
| Verificare vânzători | ✅ Automată | ⚠️ Manuală |

Această analiză demonstrează superioritatea ${keyword.keyword} în majoritatea aspectelor critice pentru utilizatori.`;
  }

  static generateLocalSection(keyword: RomanianKeyword): string {
    if (!keyword.city) return '';

    return `### ${keyword.keyword} în ${keyword.city}

Piața din ${keyword.city} cunoaște o creștere accelerată a interesului pentru ${keyword.keyword}. Comunitatea locală a îmbrățișat această soluție inovatoare, ceea ce rezultă în:

- **Livrare locală în 24-48 ore**
- **Puncte de ridicare strategice în ${keyword.city}**
- **Suport clienți în limba română**
- **Parteneriate cu afaceri locale**

Utilizatorii din ${keyword.city} raportează o experiență superioară față de alternativele existente.`;
  }

  static generateConclusion(keyword: RomanianKeyword): string {
    return `### Concluzie

${keyword.keyword} reprezintă următoarea evoluție în peisajul marketplace-urilor din România. Cu o abordare centrată pe utilizator, tehnologie avansată și prețuri competitive, această platformă oferă o experiență de shopping și vânzare fără egal.

**Începe astăzi:**
1. Creează-ți cont gratuit
2. Explorează produsele disponibile
3. Vinde propriile tale produse
4. Descoperă avantajele unei platforme moderne

Alege ${keyword.keyword} și experimentează viitorul cumpărăturilor online în România!`;
  }

  static generateProductContentStructure(keyword: RomanianKeyword, wordCount: number): string {
    return `# Produse ${keyword.keyword} - Calitate Premium

## Descriere generală
Colecția noastră de ${keyword.keyword} cuprinde cele mai căutate și apreciate produse de pe piața românească. Fiecare produs este selectat cu atenție pentru a îndeplini standardele de calitate și a satisface nevoile diverse ale clienților noștri.

## Caracteristici principale
- **Calitate garantată** - Toate produsele sunt testate și verificate
- **Prețuri competitive** - Comparați și veți fi mulțumiți
- **Livrare rapidă** - În 2-5 zile lucrătoare în toată țara
- **Garanție extinsă** - Minimum 12 luni garanție

## De ce să alegi produsele noastre?
1. **Selectare riguroasă** - Colaborăm doar cu furnizori de încredere
2. **Prețuri transparente** - Fără costuri ascunse
3. **Suport dedicat** - Echipa noastră te ajută în alegerea potrivită
4. **Retur simplu** - 30 de zile pentru returnarea produsului

Fii printre primii care descoperă calitatea superioară a produselor noastre ${keyword.keyword}!`;
  }

  static generateLandingContent(keyword: RomanianKeyword, wordCount: number, request: ContentGenerationRequest): string {
    return `${keyword.competitor 
      ? `# Înlocuiește ${keyword.competitor.toUpperCase()} cu o soluție superioară`
      : `# ${keyword.keyword} - Marketplace-ul viitorului`
    }

${keyword.competitor 
  ? `Ești sătul de limitările ${keyword.competitor.toUpperCase()}? Descoperă de ce peste 50,000 de români au făcut deja trecerea către o soluție mai bună.`
  : `În era digitală, cumpărăturile online au evoluat. ${keyword.keyword} reprezintă următoarea etapă în această evoluție.`
}

## De ce ${keyword.keyword} este alegerea corectă

### Pentru Cumpărători
✅ **Produse verificate și sigure**
✅ **Prețuri competitive și transparente**
✅ **Livrare gratuită pentru comenzi peste 99 RON**
✅ **Protecția cumpărătorului garantată**

### Pentru Vânzători  
✅ **Comisioane mici (doar 3-5%)**
✅ **Instrumentele de marketing incluse**
✅ **Suport dedicat pentru business**
✅ **Analytics detaliat pentru creștere**

### Pentru Ambele
✅ **Platformă sigură și de încredere**
✅ **Aplicație mobilă optimizată**
✅ **Community activ și moderat**
✅ **Tehnologie de vârf pentru siguranță**

## Garanția noastră pentru tine
- **Returnare în 30 de zile** - Nu ești mulțumit? Îți returnăm banii
- **Livrare gratuită** - Pentru comenzi peste 99 RON
- **Suport 24/7** - Echipa noastră este mereu disponibilă
- **Siguranță garantată** - Plăți securizate cu criptare SSL

${keyword.city 
  ? `## Disponibil în ${keyword.city} și în toată România

Serviciile noastre sunt disponibile în ${keyword.city} cu livrare în 24-48 ore. Puncte de ridicare sunt situate strategic în zona centrală pentru acces facil.`
  : `## Disponibil în toată România

Serviciile noastre sunt disponibile în toată țara, cu livrare în 2-5 zile lucrătoare și puncte de ridicare în marile orașe.`
}

## Începe astăzi!
Nu mai aștepta să profiți de avantajele unei platforme moderne. Fă pasul către viitorul cumpărăturilor online.

[Începe să cumperi acum!]
[Începe să vinzi acum!]

*Deja peste 50,000 de români au ales ${keyword.keyword}. Alătură-te comunității noastre astăzi!*`;
  }

  static generateSocialContentStructure(keyword: RomanianKeyword): string {
    return `Post social media optimizat pentru ${keyword.keyword}:

🔥 Să știi că ${keyword.keyword} este soluția pe care o căutai?

✅ Comisioane mici pentru vânzători  
✅ Produse verificate și sigure  
✅ Livrare rapidă în toată țara  
✅ Suport clienți 24/7  

#${keyword.keyword.replace(/ /g, '')} #MarketplaceRomania #CumparaturiOnline #VanzariOnline`;
  }

  static generateMetaDescription(keyword: RomanianKeyword, title: string): string {
    return `Descoperă ${keyword.keyword}. Marketplace-ul sigur și modern pentru cumpărături și vânzări online în România. Calitate garantată, prețuri competitive.`;
  }

  static generateSlug(title: string): string {
    return title
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

  static extractKeywords(content: string, primaryKeyword: RomanianKeyword): string[] {
    const keywords = [primaryKeyword.keyword];
    
    // Add related Romanian marketplace terms
    const relatedTerms = [
      'marketplace romania',
      'cumparaturi online',
      'vanzari online',
      'piata online',
      'romania'
    ];
    
    keywords.push(...relatedTerms);
    
    // Add city if present
    if (primaryKeyword.city) {
      keywords.push(primaryKeyword.city.toLowerCase());
    }
    
    return keywords;
  }

  static generateLandingKeywords(keyword: RomanianKeyword): string[] {
    const keywords = [keyword.keyword];
    
    if (keyword.competitor) {
      keywords.push(`alternativa la ${keyword.competitor}`);
      keywords.push(`${keyword.competitor} vs`);
    }
    
    if (keyword.city) {
      keywords.push(`${keyword.keyword} ${keyword.city}`);
    }
    
    keywords.push('marketplace romania', 'cumparaturi online', 'vanzari sigure');
    
    return keywords;
  }

  static generateBlogStructuredData(keyword: RomanianKeyword, title: string, content: string): object {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": `Articol despre ${keyword.keyword} - Ghid complet pentru piața românească`,
      "image": "https://piata-ai.ro/og-image.jpg",
      "author": {
        "@type": "Organization",
        "name": "Piata AI RO"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Piata AI RO",
        "logo": {
          "@type": "ImageObject",
          "url": "https://piata-ai.ro/logo.png"
        }
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://piata-ai.ro/blog/${AIContentGenerator.generateSlug(title)}`
      },
      "keywords": keyword.keyword,
      "articleSection": "Marketplace Romania",
      "wordCount": content.split(' ').length
    };
  }

  static generateProductStructuredData(keyword: RomanianKeyword, title: string): object {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": `Colecție completă de ${keyword.keyword} la prețuri competitive`,
      "url": `https://piata-ai.ro/categorii/${AIContentGenerator.generateSlug(keyword.keyword)}`, 
      "publisher": {
        "@type": "Organization",
        "name": "Piata AI RO"
      }
    };
  }

  static generateLandingStructuredData(keyword: RomanianKeyword, title: string): object {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": `Descoperă ${keyword.keyword} - Marketplace-ul modern pentru România`,
      "url": `https://piata-ai.ro/${AIContentGenerator.generateSlug(keyword.keyword)}`, 
      "isPartOf": {
        "@type": "WebSite",
        "name": "Piata AI RO",
        "url": "https://piata-ai.ro"
      },
      "about": {
        "@type": "Thing",
        "name": keyword.keyword
      }
    };
  }
}

// Bulk content generation utility
export class BulkContentGenerator {
  static async generateContentBatch(requests: ContentGenerationRequest[]): Promise<GeneratedContent[]> {
    const results = [];
    
    for (const request of requests) {
      try {
        const content = await AIContentGenerator.generateContent(request);
        results.push(content);
      } catch (error) {
        console.error(`Failed to generate content for ${request.keyword}:`, error);
        // Continue with other requests even if one fails
      }
    }
    
    return results;
  }

  static generateContentCalendarFromKeywords(): ContentGenerationRequest[] {
    const requests: ContentGenerationRequest[] = [];
    
    // High priority keywords
    const highPriorityKeywords = SEO_UTILS.getKeywordsByPriority('high');
    
    highPriorityKeywords.forEach(keyword => {
      requests.push({
        keyword: keyword.keyword,
        contentType: keyword.category === 'competitor' ? 'landing' : 'blog',
        competitor: keyword.competitor,
        targetCity: keyword.city,
        tone: 'professional',
        length: 'medium',
        includeSEO: true
      });
    });
    
    return requests;
  }
}

// Content optimization utilities
export class ContentOptimizer {
  static optimizeForRomanian(content: string, targetKeyword: string): string {
    // Add Romanian-specific optimizations
    let optimizedContent = content;
    
    // Ensure keyword appears in first 100 words
    const firstParagraph = optimizedContent.split('\n\n')[0];
    if (!firstParagraph.includes(targetKeyword)) {
      optimizedContent = optimizedContent.replace(
        firstParagraph,
        `${firstParagraph} ${targetKeyword}`
      );
    }
    
    // Add Romanian call-to-actions
    const romanianCTAs = [
      'Începe să cumperi acum!',
      'Înregistrează-te gratuit!',
      'Descoperă oferta completă!',
      'Profită de avantajele noastre!'
    ];
    
    if (!optimizedContent.includes('Începe')) {
      optimizedContent += `\n\n**${romanianCTAs[Math.floor(Math.random() * romanianCTAs.length)]}**`;
    }
    
    return optimizedContent;
  }

  static extractReadabilityScore(content: string): number {
    // Simple readability calculation for Romanian text
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Score from 0-100 (higher is better)
    return Math.max(0, 100 - (avgWordsPerSentence * 2));
  }

  static generateContentReport(content: GeneratedContent): object {
    return {
      titleLength: content.title.length,
      metaDescriptionLength: content.metaDescription.length,
      wordCount: content.content.split(/\s+/).length,
      keywordDensity: this.calculateKeywordDensity(content.content, content.keywords[0]),
      readabilityScore: this.extractReadabilityScore(content.content),
      hasStructuredData: !!content.structuredData,
      h1Length: content.h1.length,
      recommendations: this.generateRecommendations(content)
    };
  }

  private static calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;
    return (keywordCount / words.length) * 100;
  }

  static generateRecommendations(content: GeneratedContent): string[] {
    const recommendations = [];
    
    if (content.title.length > 60) {
      recommendations.push('Consider shortening the title for better SERP display');
    }
    
    if (content.metaDescription.length > 160) {
      recommendations.push('Meta description is too long, consider shortening it');
    }
    
    const wordCount = content.content.split(/\s+/).length;
    if (wordCount < 300) {
      recommendations.push('Content is quite short, consider expanding for better SEO');
    }
    
    if (!content.structuredData) {
      recommendations.push('Add structured data for better search visibility');
    }
    
    return recommendations;
  }
}