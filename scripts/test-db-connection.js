const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.oikhfoaltormcigauobs:ancutadavid_24A@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT count(*) FROM auth.users');
    console.log("Auth Users count:", res.rows[0].count);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
