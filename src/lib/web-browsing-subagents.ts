// import puppeteer, { Browser } from 'puppeteer'; // Puppeteer is removed as a dependency for now.

// Web browsing subagent configuration
export interface SubagentConfig {
  name: string;
  source: string;
  baseUrl: string;
  description: string;
  selectors: {
    listings: string;
    title: string;
    price: string;
    description?: string;
    location?: string;
    image?: string;
    link?: string;
  };
  pagination?: {
    nextButton: string;
    maxPages: number;
  };
}

// Scraped listing result
export interface ScrapedListing {
  title: string;
  price: string;
  description?: string;
  location?: string;
  image?: string;
  link?: string;
  source: string;
  scrapedAt: string;
}

// Search filters
export interface SearchFilters {
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  category?: string;
  maxPages?: number;
}

/**
 * Web Browsing Subagent - Uses Puppeteer to scrape marketplace websites
 */
export class WebBrowsingSubagent {
  private config: SubagentConfig;
  // private browser: puppeteer.Browser | null = null; // Puppeteer is removed as a dependency for now.

  constructor(config: SubagentConfig) {
    this.config = config;
  }

  /**
   * Main scraping method
   */
  async scrape(filters: SearchFilters): Promise<ScrapedListing[]> {
    console.log(`[Subagent] ${this.config.name}: Starting scrape with filters`, filters);
    
    try {
      // Puppeteer functionality is commented out as the dependency is removed.
      // The following code would be used if puppeteer were still active:
      // this.browser = await puppeteer.launch({
      //   headless: true,
      //   args: ['--no-sandbox', '--disable-setuid-sandbox']
      // });
      // const page = await this.browser.newPage();
      // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      // const searchUrl = this.buildSearchUrl(filters);
      // console.log(`[Subagent] ${this.config.name}: Navigating to ${searchUrl}`);
      // await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      // await page.waitForSelector(this.config.selectors.listings, { timeout: 10000 });
      // const listings = await this.scrapeListings(page, filters);
      // console.log(`[Subagent] ${this.config.name}: Scraped ${listings.length} listings`);
      // return listings;

      // Placeholder for now, as puppeteer is removed.
      // In a real scenario, this would be replaced with a non-puppeteer scraping method or removed.
      console.warn(`[Subagent] ${this.config.name}: Puppeteer functionality is disabled. Returning empty listings.`);
      return [];
    } catch (error) {
      console.error(`[Subagent] ${this.config.name} failed:`, error);
      // Rethrow or handle error appropriately if not using puppeteer
      // For now, return empty listings to avoid build failure
      return [];
    } finally {
      // if (this.browser) {
      //   await this.browser.close();
      // }
    }
  }

  /**
   * Build search URL based on filters
   */
  private buildSearchUrl(filters: SearchFilters): string {
    const baseUrl = this.config.baseUrl;
    const params = new URLSearchParams();

    if (filters.keywords && filters.keywords.length > 0) {
      params.set('q', filters.keywords.join(' '));
    }

    if (filters.minPrice) {
      params.set('min_price', filters.minPrice.toString());
    }

    if (filters.maxPrice) {
      params.set('max_price', filters.maxPrice.toString());
    }

    if (filters.location) {
      params.set('location', filters.location);
    }

    if (filters.category) {
      params.set('category', filters.category);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Scrape listings from current page
   */
  private async scrapeListings(page: any, filters: SearchFilters): Promise<ScrapedListing[]> { // Changed page type to any to avoid puppeteer type errors
    const maxPages = filters.maxPages || this.config.pagination?.maxPages || 3;
    const allListings: ScrapedListing[] = [];
    const currentPage = 1;

    while (currentPage <= maxPages) {
      console.log(`[Subagent] ${this.config.name}: Scraping page ${currentPage}/${maxPages}`);
      
      try {
        // Extract listings from current page
        const pageListings = await page.evaluate((selectors: any) => {
          const listingElements = document.querySelectorAll(selectors.listings);
          const listings: ScrapedListing[] = [];

          listingElements.forEach(element => {
            const titleElement = element.querySelector(selectors.title);
            const priceElement = element.querySelector(selectors.price);
            const descriptionElement = element.querySelector(selectors.description || '');
            const locationElement = element.querySelector(selectors.location || '');
            const imageElement = element.querySelector(selectors.image || '');
            const linkElement = element.querySelector(selectors.link || '');

            if (titleElement && priceElement) {
              listings.push({
                title: titleElement.textContent?.trim() || '',
                price: priceElement.textContent?.trim() || '',
                description: descriptionElement?.textContent?.trim(),
                location: locationElement?.textContent?.trim(),
                image: (imageElement as HTMLImageElement)?.src,
                link: (linkElement as HTMLAnchorElement)?.href,
                source: window.location.hostname,
                scrapedAt: new Date().toISOString()
              });
            }
          });

          return listings;
        }, this.config.selectors);

        console.log(`[Subagent] ${this.config.name}: Found ${pageListings.length} listings on page ${currentPage}`);

        // Filter listings based on criteria
        const filteredListings = this.filterListings(pageListings, filters);
        allListings.push(...filteredListings);

        // Check if there's a next page
        // Puppeteer functionality is disabled, so pagination is not available.
        // if (this.config.pagination && currentPage < maxPages) {
        //   const hasNextPage = await this.goToNextPage(page);
        //   if (!hasNextPage) {
        //     console.log(`[Subagent] ${this.config.name}: No more pages to scrape`);
        //     break;
        //   }
        //   currentPage++;
        //
        //   // Wait for next page to load
        //   await page.waitForTimeout(2000);
        // } else {
        //   break;
        // }
        // Since puppeteer is disabled, we break after the first (and only) page.
        break;
      } catch (error) {
        console.error(`[Subagent] ${this.config.name}: Error scraping page ${currentPage}:`, error);
        break;
      }
    }

    return allListings;
  }

  /**
   * Navigate to next page
   * This function is commented out as puppeteer is no longer used.
   */
  // private async goToNextPage(page: any): Promise<boolean> { // Changed type to any to avoid build error, but function is disabled anyway.
  //   if (!this.config.pagination?.nextButton) {
  //     return false;
  //   }
  //
  //   try {
  //     // Puppeteer functionality is disabled.
  //     // const nextButton = await page.$(this.config.pagination.nextButton);
  //     // if (nextButton) {
  //     //   await nextButton.click();
  //     //   await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
  //     //   return true;
  //     // }
  //     return false;
  //   } catch (error) {
  //     console.error(`[Subagent] ${this.config.name}: Failed to navigate to next page:`, error);
  //     return false;
  //   }
  // }

  /**
   * Filter listings based on search criteria
   */
  private filterListings(listings: ScrapedListing[], filters: SearchFilters): ScrapedListing[] {
    return listings.filter(listing => {
      // Price filter
      if (filters.minPrice || filters.maxPrice) {
        const price = this.extractPrice(listing.price);
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
      }

      // Keywords filter
      if (filters.keywords && filters.keywords.length > 0) {
        const title = listing.title.toLowerCase();
        const hasKeyword = filters.keywords.some(keyword => 
          title.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      // Location filter
      if (filters.location && listing.location) {
        const location = listing.location.toLowerCase();
        const filterLocation = filters.location.toLowerCase();
        if (!location.includes(filterLocation)) return false;
      }

      return true;
    });
  }

  /**
   * Extract numeric price from price string
   */
  private extractPrice(priceString: string): number {
    const priceMatch = priceString.replace(/[^0-9.,]/g, '').replace(',', '.');
    return parseFloat(priceMatch) || 0;
  }
}

// Subagent configurations for different marketplaces
export const SUBAGENT_CONFIGS: SubagentConfig[] = [
  {
    name: 'publi24-scraper',
    source: 'Publi24',
    baseUrl: 'https://www.publi24.ro/adaugate',
    description: 'Scrapes listings from Publi24 marketplace',
    selectors: {
      listings: '.announcement-item',
      title: '.announcement-title',
      price: '.announcement-price',
      description: '.announcement-description',
      location: '.announcement-location',
      image: '.announcement-image img',
      link: '.announcement-link'
    },
    pagination: {
      nextButton: '.pagination-next',
      maxPages: 5
    }
  },
  {
    name: 'olx-scraper',
    source: 'OLX',
    baseUrl: 'https://www.olx.ro/oferte/q-',
    description: 'Scrapes listings from OLX marketplace',
    selectors: {
      listings: '.offer-wrapper',
      title: '.lheight22',
      price: '.price strong',
      description: '.description',
      location: '.breadcrumb span',
      image: '.photo-cell img',
      link: '.detailsLink'
    },
    pagination: {
      nextButton: '.pager-next',
      maxPages: 5
    }
  },
  {
    name: 'autovit-scraper',
    source: 'Autovit',
    baseUrl: 'https://www.autovit.ro/autoturisme',
    description: 'Scrapes car listings from Autovit marketplace',
    selectors: {
      listings: '.offer-item',
      title: '.offer-title',
      price: '.offer-price .offer-price__number',
      description: '.offer-item__content',
      location: '.offer-item__location',
      image: '.offer-item__photo img',
      link: '.offer-item__link'
    },
    pagination: {
      nextButton: '.next',
      maxPages: 5
    }
  }
];

/**
 * Factory function to create subagent instances
 */
export function createSubagent(configName: string): WebBrowsingSubagent {
  const config = SUBAGENT_CONFIGS.find(c => c.name === configName);
  if (!config) {
    throw new Error(`Unknown subagent config: ${configName}`);
  }
  return new WebBrowsingSubagent(config);
}

/**
 * Run all subagents in parallel
 */
export async function runAllSubagents(filters: SearchFilters): Promise<ScrapedListing[]> {
  console.log('[WebBrowsingSubagents] Starting all subagents');
  
  const subagentPromises = SUBAGENT_CONFIGS.map(async (config) => {
    try {
      const subagent = new WebBrowsingSubagent(config);
      const listings = await subagent.scrape(filters);
      console.log(`[WebBrowsingSubagents] ${config.name}: ${listings.length} listings`);
      return listings;
    } catch (error) {
      console.error(`[WebBrowsingSubagents] ${config.name} failed:`, error);
      return [];
    }
  });

  const results = await Promise.all(subagentPromises);
  const allListings = results.flat();
  
  console.log(`[WebBrowsingSubagents] Total listings: ${allListings.length}`);
  return allListings;
}