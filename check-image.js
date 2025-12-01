const https = require('https');

// Test one of the image URLs from the database
const testUrl = 'https://ndzoavaveppnclkujjhh.supabase.co/storage/v1/object/public/listings/listing_ea7c45d5-0afa-4725-8ad0-352d15b97e92_1764531055977_0.jpg';

console.log('Testing image URL:', testUrl);

https.get(testUrl, (res) => {
  console.log('Response status code:', res.statusCode);
  console.log('Response headers:', res.headers['content-type']);
  
  if (res.statusCode === 200) {
    console.log('✅ Image is accessible');
  } else {
    console.log('❌ Image is not accessible');
  }
  
  // Just read the headers, don't download the full image
  res.destroy();
}).on('error', (err) => {
  console.log('❌ Error accessing image:', err.message);
});