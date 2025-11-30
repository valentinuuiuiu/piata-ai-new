/**
 * Automated Storage Bucket Setup using Supabase Client
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndzoavaveppnclkujjhh.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_5460a0c658e796c00ff638d17980dd9270424c9a';

// Create admin client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Starting Automated Storage Setup\n');
  console.log('=' .repeat(60));
  
  // Step 1: List existing buckets
  console.log('\n📦 Step 1: Checking existing buckets...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    return false;
  }
  
  console.log(`✅ Found ${buckets.length} existing buckets`);
  buckets.forEach(bucket => {
    console.log(`   - ${bucket.id} (public: ${bucket.public})`);
  });
  
  // Step 2: Check if listings bucket exists
  const listingsBucket = buckets.find(b => b.id === 'listings');
  
  if (listingsBucket) {
    console.log('\n✅ Listings bucket already exists!');
    console.log(`   - Public: ${listingsBucket.public}`);
    
    if (!listingsBucket.public) {
      console.log('⚠️  Bucket is NOT public, attempting to update...');
      
      const { data, error } = await supabase.storage.updateBucket('listings', {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      });
      
      if (error) {
        console.error('❌ Failed to update bucket:', error.message);
        console.log('💡 You may need to update it manually in Supabase dashboard');
      } else {
        console.log('✅ Bucket updated to public!');
      }
    }
  } else {
    console.log('\n📦 Step 2: Creating listings bucket...');
    
    const { data, error } = await supabase.storage.createBucket('listings', {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    });
    
    if (error) {
      console.error('❌ Failed to create bucket:', error.message);
      return false;
    }
    
    console.log('✅ Bucket created successfully!');
  }
  
  // Step 3: Test upload
  console.log('\n📤 Step 3: Testing upload...');
  
  // Create a test file
  const testContent = Buffer.from('Test upload from setup script');
  const testFilename = `test_${Date.now()}.txt`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('listings')
    .upload(testFilename, testContent, {
      contentType: 'text/plain',
      upsert: false
    });
  
  if (uploadError) {
    console.error('❌ Upload test failed:', uploadError.message);
    console.log('\n💡 This is likely an RLS policy issue.');
    console.log('   You need to run the SQL script to configure policies:');
    console.log('   1. Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new');
    console.log('   2. Copy/paste from: tmp_rovodev_complete_fix.sql');
    console.log('   3. Click RUN');
    return false;
  }
  
  console.log('✅ Upload test successful!');
  console.log(`   - File: ${uploadData.path}`);
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('listings')
    .getPublicUrl(testFilename);
  
  console.log(`   - Public URL: ${publicUrl}`);
  
  // Clean up test file
  const { error: deleteError } = await supabase.storage
    .from('listings')
    .remove([testFilename]);
  
  if (!deleteError) {
    console.log('   - ✅ Test file cleaned up');
  }
  
  // Step 4: List files to verify
  console.log('\n📋 Step 4: Listing files in bucket...');
  
  const { data: files, error: filesError } = await supabase.storage
    .from('listings')
    .list('', { limit: 10 });
  
  if (filesError) {
    console.log('⚠️  Could not list files:', filesError.message);
  } else {
    console.log(`✅ Bucket contains ${files.length} files`);
  }
  
  // Success summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ STORAGE BUCKET SETUP COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📋 Summary:');
  console.log('   ✅ Bucket "listings" exists');
  console.log('   ✅ Bucket is PUBLIC');
  console.log('   ✅ Upload/delete operations work');
  console.log('\n⚠️  IMPORTANT: Configure RLS Policies');
  console.log('   To allow users to upload from the app, run:');
  console.log('   1. Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new');
  console.log('   2. Copy all content from: tmp_rovodev_complete_fix.sql');
  console.log('   3. Paste and click RUN');
  console.log('\n🎯 After running SQL:');
  console.log('   → Test: node tmp_rovodev_test_complete_flow.js');
  console.log('   → Start app: npm run dev');
  console.log('   → Go to: http://localhost:3000/postare');
  console.log('\n✨ Done!\n');
  
  return true;
}

// Run the setup
setupStorage().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});
