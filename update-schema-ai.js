const { Client } = require('pg');

async function updateSchema() {
  const client = new Client({
    connectionString: "postgresql://postgres.ndzoavaveppnclkujjhh:ancutadavid_24A@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      -- 1. Add missing AI and Verification columns to anunturi
      ALTER TABLE anunturi 
      ADD COLUMN IF NOT EXISTS ai_validation_score INTEGER,
      ADD COLUMN IF NOT EXISTS ai_validation_issues JSONB,
      ADD COLUMN IF NOT EXISTS ai_validation_suggestions JSONB,
      ADD COLUMN IF NOT EXISTS ai_approved BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ai_validated_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
      ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
      ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS user_confirmed_at TIMESTAMP WITH TIME ZONE;

      -- 2. Ensure log table exists
      CREATE TABLE IF NOT EXISTS ai_validation_logs (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES anunturi(id) ON DELETE CASCADE,
        action VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        processed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20),
        error_message TEXT
      );

      -- 3. Clean up Matrimoniale subcategories (User request: Matrimoniale has no subcategories)
      DELETE FROM subcategories WHERE category_id = 10;
      
      -- 4. Ensure category icon/slug for Matrimoniale is correct
      UPDATE categories SET name = 'Matrimoniale', slug = 'matrimoniale', icon = '❤️' WHERE id = 10;
    `;

    await client.query(sql);
    console.log('Schema updated successfully');

  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

updateSchema();
