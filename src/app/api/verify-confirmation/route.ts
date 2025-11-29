/**
 * Email Confirmation Handler
 * Processes verification tokens from email links
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashToken } from '@/lib/email-automation';

// Mock database - replace with actual DB integration
const verificationStore = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/verification-error?message=missing-token', request.url)
      );
    }

    const tokenHash = hashToken(token);
    const verification = verificationStore.get(tokenHash);

    if (!verification) {
      return NextResponse.redirect(
        new URL('/verification-error?message=invalid-token', request.url)
      );
    }

    if (verification.isUsed) {
      return NextResponse.redirect(
        new URL('/verification-error?message=token-used', request.url)
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.redirect(
        new URL('/verification-error?message=token-expired', request.url)
      );
    }

    // Mark token as used
    verification.isUsed = true;
    verificationStore.set(tokenHash, verification);

    // Handle different verification types
    switch (verification.type) {
      case 'account_creation':
        return await handleAccountCreationConfirmation(verification, request);
      case 'ad_posting':
        return await handleAdPostingConfirmation(verification, request);
      case 'permission_approval':
        return await handlePermissionApproval(verification, request);
      case 'permission_rejection':
        return await handlePermissionRejection(verification, request);
      default:
        return NextResponse.redirect(
          new URL('/verification-error?message=invalid-type', request.url)
        );
    }
  } catch (error) {
    console.error('❌ Email confirmation error:', error);
    return NextResponse.redirect(
      new URL('/verification-error?message=server-error', request.url)
    );
  }
}

async function handleAccountCreationConfirmation(verification: any, request: NextRequest) {
  // In production, create user account in database
  
  return NextResponse.redirect(
    new URL('/verification-success?type=account&email=' + encodeURIComponent(verification.email), request.url)
  );
}

async function handleAdPostingConfirmation(verification: any, request: NextRequest) {
  // In production, post the ad to the specified platform
  
  return NextResponse.redirect(
    new URL('/verification-success?type=ad&platform=' + verification.data.adData.platform, request.url)
  );
}

async function handlePermissionApproval(verification: any, request: NextRequest) {
  // In production, approve the permission request
  
  return NextResponse.redirect(
    new URL('/verification-success?type=permission-approved', request.url)
  );
}

async function handlePermissionRejection(verification: any, request: NextRequest) {
  // In production, reject the permission request
  
  return NextResponse.redirect(
    new URL('/verification-success?type=permission-rejected', request.url)
  );
}