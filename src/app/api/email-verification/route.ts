/**
 * Email Verification API Routes
 * Handles account creation, ad posting, and permission request confirmations
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateVerificationToken, 
  hashToken, 
  sendAccountCreationEmail,
  sendAdPostingConfirmationEmail,
  sendPermissionRequestEmail,
  EmailTestService
} from '@/lib/email';

// Type definitions for verification data
interface AccountCreationData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AdPostingData {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  location?: string;
  platform?: string;
}

interface PermissionRequestData {
  requestedPermission: string;
  reason: string;
  userId: number;
}

// Mock database - replace with actual DB integration
const verificationStore = new Map();

export async function POST(request: NextRequest) {
  try {
    const { type, email, data } = await request.json();

    switch (type) {
      case 'account_creation':
        return await handleAccountCreation(email, data);
      case 'ad_posting':
        return await handleAdPosting(email, data);
      case 'permission_request':
        return await handlePermissionRequest(email, data);
      case 'test_system':
        return await handleTestSystem();
      default:
        return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Email verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleAccountCreation(email: string, data: AccountCreationData) {
  const token = generateVerificationToken();
  const tokenHash = hashToken(token);
  
  // Store verification data (replace with DB)
  verificationStore.set(tokenHash, {
    email,
    type: 'account_creation',
    data,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    isUsed: false,
  });

  // Send confirmation email
  const emailResult = await sendAccountCreationEmail(
    email,
    token,
    data.name
  );

  if (!emailResult.success) {
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Account creation confirmation email sent',
    tokenHash,
  });
}

async function handleAdPosting(email: string, data: AdPostingData) {
  const token = generateVerificationToken();
  const tokenHash = hashToken(token);
  
  // Store verification data (replace with DB)
  verificationStore.set(tokenHash, {
    email,
    type: 'ad_posting',
    data,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    isUsed: false,
  });

  // Send confirmation email
  const emailResult = await sendAdPostingConfirmationEmail(
    email,
    {
      title: data.title,
      platform: 'Piata AI RO',
      category: data.categoryId.toString(),
      price: data.price,
      location: data.location,
    },
    token
  );

  if (!emailResult.success) {
    return NextResponse.json(
      { error: 'Failed to send ad posting confirmation email' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Ad posting confirmation email sent',
    tokenHash,
  });
}

async function handlePermissionRequest(email: string, data: PermissionRequestData) {
  const approvalToken = generateVerificationToken();
  const rejectionToken = generateVerificationToken();
  
  const approvalHash = hashToken(approvalToken);
  const rejectionHash = hashToken(rejectionToken);
  
  // Store verification data (replace with DB)
  verificationStore.set(approvalHash, {
    email,
    type: 'permission_approval',
    data,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    isUsed: false,
  });

  verificationStore.set(rejectionHash, {
    email,
    type: 'permission_rejection',
    data,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    isUsed: false,
  });

  // Send permission request email to admin
  const emailResult = await sendPermissionRequestEmail(
    'admin@piata-ai.ro', // Admin email
    {
      requesterName: 'User', // Would need to get from user data
      requesterEmail: email,
      platform: 'Piata AI RO',
      adTitle: data.requestedPermission,
      reason: data.reason,
      approvalLink: `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-confirmation?token=${approvalToken}`,
      rejectionLink: `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-confirmation?token=${rejectionToken}`,
    }
  );

  if (!emailResult.success) {
    return NextResponse.json(
      { error: 'Failed to send permission request email' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Permission request email sent to admin',
    approvalHash,
    rejectionHash,
  });
}

async function handleTestSystem() {
  const testResults = await EmailTestService.testAllEmailServices();
  
  return NextResponse.json({
    success: true,
    message: 'Email system test completed',
    results: testResults,
  });
}