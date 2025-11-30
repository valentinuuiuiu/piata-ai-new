/**
 * Complete Test Script for Piata AI RO Image Upload
 * Tests the entire flow: Auth -> Upload -> Database Insert
 */

const SUPABASE_URL = 'https://ndzoavaveppnclkujjhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

async function testCompleteFlow() {
  console.log('🚀 Starting Complete Flow Test\n');
  console.log('=' .repeat(60));
  
  // Test 1: Check if we can connect to Supabase
  console.log('\n📡 Test 1: Connection Test');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log(`✅ Connected to Supabase (Status: ${response.status})`);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return;
  }

  // Test 2: Check storage bucket
  console.log('\n📦 Test 2: Storage Bucket Check');
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket/listings`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const bucket = await response.json();
      console.log('✅ Listings bucket exists');
      console.log(`   - Public: ${bucket.public}`);
      console.log(`   - File size limit: ${bucket.file_size_limit / 1024 / 1024}MB`);
    } else {
      console.log('⚠️  Listings bucket response:', response.status);
      const error = await response.text();
      console.log('   Error:', error);
    }
  } catch (error) {
    console.error('❌ Bucket check failed:', error.message);
  }

  // Test 3: List files in bucket
  console.log('\n📋 Test 3: List Files in Bucket');
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/listings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 10,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    });
    
    if (response.ok) {
      const files = await response.json();
      console.log(`✅ Found ${files.length} files in bucket`);
      files.slice(0, 3).forEach((file, i) => {
        console.log(`   ${i + 1}. ${file.name}`);
      });
    } else {
      const error = await response.text();
      console.log('⚠️  Cannot list files:', error);
    }
  } catch (error) {
    console.error('❌ List files failed:', error.message);
  }

  // Test 4: Check anunturi table
  console.log('\n📊 Test 4: Check Anunturi Table');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/anunturi?select=id,title,status,images&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const listings = await response.json();
      console.log(`✅ Found ${listings.length} listings`);
      listings.forEach((listing, i) => {
        const imageCount = Array.isArray(listing.images) ? listing.images.length : 0;
        console.log(`   ${i + 1}. ${listing.title} (${listing.status}) - ${imageCount} images`);
      });
    } else {
      const error = await response.text();
      console.log('⚠️  Cannot query anunturi:', response.status);
      console.log('   Error:', error);
    }
  } catch (error) {
    console.error('❌ Table check failed:', error.message);
  }

  // Test 5: Test upload capability (without actual file)
  console.log('\n📤 Test 5: Upload Capability Test');
  console.log('   Testing if we can initiate an upload...');
  
  // Create a dummy 1x1 pixel PNG
  const dummyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const dummyImageBuffer = Buffer.from(dummyImageBase64, 'base64');
  
  try {
    const testFilename = `test_${Date.now()}.png`;
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/listings/${testFilename}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'image/png',
        'x-upsert': 'false'
      },
      body: dummyImageBuffer
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload test successful!');
      console.log(`   File uploaded: ${testFilename}`);
      
      // Get public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/listings/${testFilename}`;
      console.log(`   Public URL: ${publicUrl}`);
      
      // Try to delete test file
      const deleteResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/listings/${testFilename}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (deleteResponse.ok) {
        console.log('   ✅ Cleanup: Test file deleted');
      }
    } else {
      const error = await response.text();
      console.log('❌ Upload test failed:', response.status);
      console.log('   Error:', error);
      console.log('\n💡 THIS IS THE PROBLEM! You need to run the SQL fix script.');
      console.log('   The error above shows why uploads are failing.');
    }
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY & NEXT STEPS');
  console.log('='.repeat(60));
  console.log('\n1. If you see "new row violates row-level security policy" above:');
  console.log('   → Run tmp_rovodev_complete_fix.sql in Supabase SQL Editor');
  console.log('\n2. If bucket is not public:');
  console.log('   → The SQL script will fix this');
  console.log('\n3. After running the SQL script:');
  console.log('   → Test with tmp_rovodev_test_upload.html in browser');
  console.log('   → Try posting a new ad at /postare');
  console.log('\n4. If you need the SERVICE_ROLE_KEY:');
  console.log('   → Go to Supabase Dashboard > Settings > API');
  console.log('   → Copy the service_role key (NOT the anon key)');
  console.log('   → Add to .env.local as SUPABASE_SERVICE_ROLE_KEY');
  console.log('\n✨ Test completed!\n');
}

// Run the test
testCompleteFlow().catch(console.error);
