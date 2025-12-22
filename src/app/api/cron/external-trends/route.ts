import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@/lib/drizzle/db';
import { marketingInsights } from '@/lib/drizzle/schema';

// Helper function to extract the most common words from a list of titles
function getMostCommonWords(titles: string[], ignoreWords: string[]): string[] {
  const wordCounts: { [key: string]: number } = {};
  titles.forEach(title => {
    const words = title.split(' ');
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanWord.length > 2 && !ignoreWords.includes(cleanWord)) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
  });

  const sortedWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([word]) => word);

  return sortedWords.slice(0, 3);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[EXTERNAL-TRENDS] Scraping publi24.ro for car trends...');

    const response = await axios.get('https://www.publi24.ro/anunturi/auto-moto-si-ambarcatiuni/autoturisme/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    const listings: { title: string; location: string }[] = [];
    $('.listing-item, .article-bod, .listing-body').each((i, el) => {
      const title = $(el).find('.listing-title a, .title a, h2 a').text().trim();
      const location = $(el).find('.location, .listing-location').text().trim();
      if (title && location) {
        listings.push({ title, location });
      }
    });

    if (listings.length === 0) {
      console.log('[EXTERNAL-TRENDS] Could not find any listings. The site structure may have changed.');
      return NextResponse.json({ error: 'Failed to scrape data.' }, { status: 500 });
    }

    const titles = listings.map(l => l.title);
    // Ignore common Romanian words found in car ads
    const ignoreList = ['de', 'vand', 'in', 'cu', 'si', 'la', 'sau', 'recent', 'adusa', 'stare', 'foarte', 'buna'];
    const popularBrands = getMostCommonWords(titles, ignoreList);

    const locations = listings.map(l => l.location.split(',')[0].trim());
    const popularLocations = [...new Set(locations)].slice(0, 3);

    let promotionalMessage = 'Got something to sell? List it for free on piata-ai.ro!';
    if (popularBrands.length > 0) {
      promotionalMessage = `Top car brands like ${popularBrands.join(', ')} are in high demand, especially in areas like ${popularLocations.join(', ')}. Sell yours fast on piata-ai.ro!`;
    }

    console.log(`[EXTERNAL-TRENDS] Generated promotional message: "${promotionalMessage}"`);

    // Save the message to the database
    await db.insert(marketingInsights).values({ message: promotionalMessage });

    return NextResponse.json({ promotionalMessage });

  } catch (error) {
    console.error('[EXTERNAL-TRENDS] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
