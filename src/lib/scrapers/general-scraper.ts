import puppeteer from 'puppeteer';

export interface ScrapedContent {
  title: string;
  content: string; // HTML content
  text: string;    // Visible text content
  url: string;
}

export const scrapeContent = async (url: string): Promise<ScrapedContent> => {
  console.log(`[Scraper] Starting scrape for: ${url}`);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set a reasonable timeout
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const title = await page.title();
    
    // Get the full HTML content
    const content = await page.content();
    
    // Get the visible text content
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });

    console.log(`[Scraper] Successfully scraped: ${title}`);
    
    return {
      title,
      content,
      text,
      url
    };

  } catch (error) {
    console.error(`[Scraper] Failed to scrape ${url}:`, error);
    throw new Error(`Failed to scrape URL: ${url}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
