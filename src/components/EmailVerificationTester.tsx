"use client";

import React, { useState } from 'react';

export default function EmailVerificationTester() {
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const sendVerificationEmail = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          type: 'success',
          message: 'Verification email sent successfully!',
          data: data,
          instructions: 'Check your email and click the verification link.'
        });
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!verificationToken) {
      setError('Please enter a verification token');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/verify-email?token=${verificationToken}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          type: 'success',
          message: 'Verification status retrieved successfully!',
          data: data,
          instructions: data.verified 
            ? '✅ Email is verified and ready for use!'
            : '⏳ Email verification is pending...'
        });
      } else {
        setError(data.error || 'Failed to check verification status');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const confirmVerification = async () => {
    if (!verificationToken) {
      setError('Please enter a verification token');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/verify-email/confirm?token=${verificationToken}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          type: 'success',
          message: 'Email verification confirmed successfully!',
          data: data,
          instructions: '✅ Email verified! You can now use this email for ad posting.'
        });
      } else {
        setError(data.error || 'Failed to confirm verification');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">
        📧 Email Verification Tester
      </h2>

      {/* Send Verification Email Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-white">1. Send Verification Email</h3>
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={sendVerificationEmail}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Verification'}
          </button>
        </div>
      </div>

      {/* Verification Status Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-white">2. Check Verification Status</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value)}
            placeholder="Enter verification token (from email link)"
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={checkVerificationStatus}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
      </div>

      {/* Manual Verification Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-white">3. Manual Verification</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value)}
            placeholder="Enter verification token"
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={confirmVerification}
            disabled={loading}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Token'}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <h4 className="font-semibold text-red-300 mb-2">❌ Error</h4>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
          <h4 className="font-semibold text-green-300 mb-2">✅ {result.type === 'success' ? 'Success' : 'Result'}</h4>
          <p className="text-green-200 mb-2">{result.message}</p>
          {result.data && (
            <details className="text-green-200 text-sm">
              <summary className="cursor-pointer hover:text-green-100">View API Response</summary>
              <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
          {result.instructions && (
            <p className="text-green-200 text-sm font-medium mt-2">{result.instructions}</p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="font-semibold text-gray-300 mb-3">📋 How to Test:</h4>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Enter an email address and click "Send Verification"</li>
          <li>Check your email for the verification link</li>
          <li>Copy the token from the verification URL</li>
          <li>Use "Check Status" to see verification state</li>
          <li>Use "Verify Token" for manual confirmation</li>
        </ol>
      </div>

      {/* API Information */}
      <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
        <h4 className="font-semibold text-blue-300 mb-2">🔗 API Endpoints</h4>
        <div className="text-sm text-blue-200 space-y-1">
          <div><code className="bg-blue-800 px-2 py-1 rounded">POST /api/verify-email</code> - Send verification</div>
          <div><code className="bg-blue-800 px-2 py-1 rounded">GET /api/verify-email?token=xxx</code> - Check status</div>
          <div><code className="bg-blue-800 px-2 py-1 rounded">GET /api/verify-email/confirm?token=xxx</code> - Confirm</div>
        </div>
      </div>
    </div>
  );
}