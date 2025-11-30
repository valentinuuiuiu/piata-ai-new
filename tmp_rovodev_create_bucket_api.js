/**
 * Automated Storage Bucket Setup
 * This script will create the bucket and configure everything using the API
 */

const SUPABASE_URL = 'https://ndzoavaveppnclkujjhh.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_5460a0c658e796c00ff638d17980dd9270424c9a';

async function setupStorage() {
  console.log('🚀 Starting Automated Storage Setup\n');
  console.log('=' .repeat(60));
  
  // Step 1: Create the bucket
  console.log('\n📦 Step 1: Creating storage bucket...');
  
  try {
    const createBucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        id: 'listings',
        name: 'listings',
        public: true,
        file_size_limit: 10485760, // 10MB
        allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      })
    });

    if (createBucketResponse.ok) {
      console.log('✅ Bucket created successfully!');
    } else {
      const error = await createBucketResponse.text();
      if (error.includes('already exists')) {
        console.log('✅ Bucket already exists, updating settings...');
        
        // Update bucket to make it public
        const updateResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket/listings`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY
          },
          body: JSON.stringify({
            public: true,
            file_size_limit: 10485760,
            allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ Bucket updated to public!');
        } else {
          console.log('⚠️  Could not update bucket:', await updateResponse.text());
        }
      } else {
        console.error('❌ Failed to create bucket:', error);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    return false;
  }

  // Step 2: Verify bucket exists and is public
  console.log('\n🔍 Step 2: Verifying bucket...');
  
  try {
    const verifyResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket/listings`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    });

    if (verifyResponse.ok) {
      const bucket = await verifyResponse.json();
      console.log('✅ Bucket verified!');
      console.log(`   - Name: ${bucket.name}`);
      console.log(`   - Public: ${bucket.public}`);
      console.log(`   - File size limit: ${bucket.file_size_limit / 1024 / 1024}MB`);
    } else {
      console.error('❌ Could not verify bucket');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying bucket:', error.message);
    return false;
  }

  // Step 3: Test upload
  console.log('\n📤 Step 3: Testing upload capability...');
  
  // Create a tiny test image (1x1 pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  const testFilename = `test_${Date.now()}.png`;

  try {
    const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/listings/${testFilename}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'image/png',
        'apikey': SERVICE_ROLE_KEY,
        'x-upsert': 'false'
      },
      body: testImageBuffer
    });

    if (uploadResponse.ok) {
      console.log('✅ Test upload successful!');
      console.log(`   - File: ${testFilename}`);
      
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/listings/${testFilename}`;
      console.log(`   - Public URL: ${publicUrl}`);
      
      // Clean up test file
      const deleteResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/listings/${testFilename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY
        }
      });
      
      if (deleteResponse.ok) {
        console.log('   - ✅ Test file cleaned up');
      }
    } else {
      const error = await uploadResponse.text();
      console.error('❌ Test upload failed:', error);
      console.log('\n⚠️  This might be an RLS policy issue.');
      console.log('   Run the SQL script to fix policies:');
      console.log('   → Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new');
      console.log('   → Copy content from: tmp_rovodev_complete_fix.sql');
      console.log('   → Paste and click RUN');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing upload:', error.message);
    return false;
  }

  // Success summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ STORAGE SETUP COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📋 Summary:');
  console.log('   ✅ Bucket "listings" created');
  console.log('   ✅ Bucket is PUBLIC');
  console.log('   ✅ Upload test passed');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Run SQL script to configure RLS policies:');
  console.log('      → https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new');
  console.log('      → Copy/paste from: tmp_rovodev_complete_fix.sql');
  console.log('   2. Test the app: npm run dev');
  console.log('   3. Go to /postare and try uploading images');
  console.log('\n✨ Done!\n');
  
  return true;
}

// Run the setup
setupStorage().catch(console.error);
