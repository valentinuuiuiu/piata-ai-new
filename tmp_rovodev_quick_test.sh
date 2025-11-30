#!/bin/bash

# Quick test script for Piata AI RO storage
# Run this after fixing the storage bucket

echo "🚀 Testing Piata AI RO Storage Setup"
echo "======================================"
echo ""

# Test 1: Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js found"

# Test 2: Run the complete flow test
echo ""
echo "📡 Running complete flow test..."
echo ""
node tmp_rovodev_test_complete_flow.js

# Test 3: Check if .env.local exists
echo ""
echo "📄 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_URL is set"
    else
        echo "⚠️  NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo "✅ SUPABASE_SERVICE_ROLE_KEY is set"
    else
        echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not found (needed for server-side operations)"
        echo "   Get it from: Supabase Dashboard > Settings > API > service_role"
    fi
else
    echo "⚠️  .env.local not found - creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo "   ⚠️  Please fill in your actual values!"
    else
        echo "❌ .env.example also not found"
    fi
fi

echo ""
echo "======================================"
echo "📋 Next Steps:"
echo "======================================"
echo ""
echo "1. If you see 'Bucket not found' above:"
echo "   → Open STORAGE_FIX_GUIDE.md and follow the steps"
echo ""
echo "2. If tests pass (all ✅):"
echo "   → Open tmp_rovodev_test_upload.html in your browser"
echo "   → Try uploading a test image"
echo ""
echo "3. Test the full application:"
echo "   → npm run dev"
echo "   → Go to /postare and try creating an ad"
echo ""
echo "✨ Done!"
