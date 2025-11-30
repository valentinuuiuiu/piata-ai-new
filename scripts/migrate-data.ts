import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Old DB Connection
const oldDbUrl = "postgresql://postgres.oikhfoaltormcigauobs:ancutadavid_24A@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
const oldClient = new Client({
  connectionString: oldDbUrl,
  ssl: { rejectUnauthorized: false }
});

// New DB Connection (via Supabase API)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g";
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  try {
    console.log("Connecting to Old DB...");
    await oldClient.connect();
    console.log("Connected!");

    // 1. Fetch Categories
    console.log("Fetching categories from Old DB...");
    const { rows: oldCategories } = await oldClient.query('SELECT * FROM categories');
    console.log(`Found ${oldCategories.length} categories.`);

    // 2. Fetch Subcategories
    console.log("Fetching subcategories from Old DB...");
    const { rows: oldSubcategories } = await oldClient.query('SELECT * FROM subcategories');
    console.log(`Found ${oldSubcategories.length} subcategories.`);

    // 3. Insert Categories to New DB
    // First, clear existing (from seed) to avoid duplicates/conflicts if IDs match
    // Or we can upsert. Let's upsert based on name/slug.
    
    // Map old IDs to new IDs if necessary, but if we keep IDs it's better.
    // Since we just created the tables, we can try to insert with IDs.
    
    console.log("Migrating Categories...");
    for (const cat of oldCategories) {
      const { error } = await supabase
        .from('categories')
        .upsert({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          created_at: cat.created_at
        });
      
      if (error) console.error(`Error migrating category ${cat.name}:`, error.message);
    }

    console.log("Migrating Subcategories...");
    // We need to process in chunks to avoid timeouts
    const chunkSize = 50;
    for (let i = 0; i < oldSubcategories.length; i += chunkSize) {
      const chunk = oldSubcategories.slice(i, i + chunkSize).map(sub => ({
        id: sub.id,
        category_id: sub.category_id,
        name: sub.name,
        created_at: sub.created_at
      }));

      const { error } = await supabase
        .from('subcategories')
        .upsert(chunk);

      if (error) {
        console.error(`Error migrating subcategories chunk ${i}:`, error.message);
      } else {
        console.log(`Migrated subcategories ${i} to ${i + chunk.length}`);
      }
    }

    console.log("Migration complete!");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await oldClient.end();
  }
}

migrate();
