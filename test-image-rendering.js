const https = require('https');

// Test multiple image URLs from the database to check for 404 errors
const testUrls = [
  'https://ndzoavaveppnclkujjhh.supabase.co/storage/v1/object/public/listings/listing_ea7c45d5-0afa-4725-8ad0-352d15b97e92_1764531055977_0.jpg',
  'https://ndzoavaveppnclkujjhh.supabase.co/storage/v1/object/public/listings/listing_ea7c45d5-0afa-4725-8ad0-352d15b97e92_1764531056686_1.jpg',
  'https://ndzoavaveppnclkujjhh.supabase.co/storage/v1/object/public/listings/listing_ea7c45d5-0afa-4725-8ad0-352d15b97e92_1764528377603_0.png'
];

async function testImageUrls() {
  console.log('Testing image URLs for 404 errors...');
  
  for (const url of testUrls) {
    try {
      await new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
          console.log(`URL: ${url}`);
          console.log(`Status: ${res.statusCode}`);
          console.log(`Content-Type: ${res.headers['content-type']}`);
          
          if (res.statusCode === 200) {
            console.log('✅ Image accessible');
          } else {
            console.log('❌ Image not accessible');
          }
          
          // Just read the headers, don't download the full image
          res.destroy();
          resolve();
        });
        
        req.on('error', (err) => {
          console.log(`URL: ${url}`);
          console.log('❌ Error:', err.message);
          reject(err);
        });
      });
    } catch (error) {
      console.log(`Error testing ${url}:`, error.message);
    }
    console.log('---');
  }
}

testImageUrls();