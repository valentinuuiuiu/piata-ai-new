import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g";
const supabase = createClient(supabaseUrl, supabaseKey);

const PUBLI24_CATEGORIES = [
  'imobiliare', 'auto-moto-ambarcatiuni', 'locuri-de-munca',
  'matrimoniale', 'servicii', 'electronice', 'moda-accesorii',
  'animale', 'casa-gradina', 'timp-liber-sport', 'mama-copilul'
];

const CATEGORY_ICONS: Record<string, string> = {
  'Imobiliare': '🏠', 'Auto': '🚗', 'Locuri de munca': '💼',
  'Matrimoniale': '💕', 'Servicii': '🔧', 'Electronice': '📱',
  'Moda': '👗', 'Animale': '🐾', 'Casa': '🏡',
  'Sport': '⚽', 'Mama': '👶', 'Diverse': '📦'
};

async function scrapeAndSeed() {
  console.log('🔍 Scraping subcategories from Publi24...\n');

  for (const catSlug of PUBLI24_CATEGORIES) {
    try {
      console.log(`📂 Scraping: ${catSlug}`);

      const url = `https://www.publi24.ro/anunturi/${catSlug}/`;
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
        timeout: 10000
      });

      const $ = cheerio.load(data);

      // Get category name (h1 usually contains it)
      // Publi24 structure might vary, but usually h1 is the category title
      let catName = $('h1').first().text().trim();
      if (!catName) catName = catSlug.charAt(0).toUpperCase() + catSlug.slice(1);

      // Clean up name (remove "Anunturi" etc if present)
      catName = catName.replace('Anunturi ', '').replace(' de vanzare', '');

      // Determine Icon
      let icon = '📦';
      for (const key in CATEGORY_ICONS) {
        if (catName.includes(key) || catSlug.includes(key.toLowerCase())) {
          icon = CATEGORY_ICONS[key];
          break;
        }
      }

      // Insert Category
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .upsert({ 
            name: catName, 
            slug: catSlug, 
            icon: icon 
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (catError) {
        console.error(`Error inserting category ${catName}:`, catError.message);
        continue;
      }

      console.log(`✅ Category: ${catName} (ID: ${catData.id})`);

      // Scrape Subcategories
      // Look for links that are subcategories. 
      // Publi24 usually lists them in a sidebar or filter list.
      // Selector might need adjustment based on current Publi24 layout.
      // Trying common selectors for filters/categories list.
      
      const subcats = new Set<string>();
      
      // Try to find links that start with the category slug
      $('a[href*="/' + catSlug + '/"]').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        
        if (href && text && text.length > 2 && !text.includes('Toate') && !text.includes('Vezi')) {
            // Check if it's a subcategory (deeper path)
            // e.g. /anunturi/auto-moto-ambarcatiuni/autoturisme/
            const parts = href.split('/').filter(p => p);
            if (parts.length > 2) { // /anunturi/cat/subcat
                subcats.add(text);
            }
        }
      });

      // Also try specific selectors if generic fails
      if (subcats.size === 0) {
          $('.filter-category-list a, .category-list a').each((i, el) => {
              const text = $(el).text().trim();
              if (text) subcats.add(text);
          });
      }

      if (subcats.size > 0) {
        const subcatList = Array.from(subcats).map(name => ({
            category_id: catData.id,
            name: name
        }));

        // Insert Subcategories
        const { error: subError } = await supabase
            .from('subcategories')
            .insert(subcatList);

        if (subError) {
            console.error(`Error inserting subcategories for ${catName}:`, subError.message);
        } else {
            console.log(`   -> Inserted ${subcatList.length} subcategories.`);
        }
      } else {
          console.log(`   -> No subcategories found.`);
      }

    } catch (err: any) {
      console.error(`Failed to scrape ${catSlug}:`, err.message);
    }
  }
  
  console.log('\n🎉 Scraping and Seeding Complete!');
}

scrapeAndSeed();
