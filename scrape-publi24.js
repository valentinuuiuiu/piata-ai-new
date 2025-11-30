const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePubli24Categories() {
  try {
    console.log('Scraping Publi24.ro categories...\n');
    
    const response = await axios.get('https://www.publi24.ro', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const categories = {};
    
    // Find category structure - adapt selectors based on their HTML
    $('.category-list a, .categories a, nav a').each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      if (text && href && href.includes('/categor')) {
        console.log(`Category: ${text} - ${href}`);
      }
    });
    
    // Also try to find any category data in scripts
    $('script').each((i, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && (scriptContent.includes('categor') || scriptContent.includes('subcategor'))) {
        console.log('\nFound potential category data in script:', scriptContent.substring(0, 500));
      }
    });
    
    return categories;
  } catch (error) {
    console.error('Error scraping:', error.message);
  }
}

scrapePubli24Categories();
