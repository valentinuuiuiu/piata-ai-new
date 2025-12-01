import EmailVerificationTester from '@/components/EmailVerificationTester';

export default function TestEmailVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-4">
            Piata AI Email Verification System
          </h1>
          <p className="text-gray-300 text-lg">
            Test the email verification system used by RooCode for ad posting verification
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <EmailVerificationTester />
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                🔧 Technical Details
              </h2>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <strong className="text-cyan-300">API Endpoints:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li><code className="bg-gray-800 px-2 py-1 rounded">POST /api/verify-email</code> - Send verification</li>
                    <li><code className="bg-gray-800 px-2 py-1 rounded">GET /api/verify-email</code> - Check status</li>
                    <li><code className="bg-gray-800 px-2 py-1 rounded">GET /api/verify-email/confirm</code> - Confirm verification</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-cyan-300">Token Expiry:</strong> 10 minutes
                </div>
                <div>
                  <strong className="text-cyan-300">Storage:</strong> In-memory (use Redis for production)
                </div>
                <div>
                  <strong className="text-cyan-300">Email Service:</strong> Resend API
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-pink-400 mb-4">
                🚀 Integration with RooCode
              </h2>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  RooCode can now verify user emails before allowing ad posting by:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Calling <code className="bg-gray-800 px-1 rounded">POST /api/verify-email</code> with user email</li>
                  <li>Checking verification status via <code className="bg-gray-800 px-1 rounded">GET /api/verify-email</code></li>
                  <li>Only allowing ad posting for verified emails</li>
                </ol>
                <p className="mt-3 text-cyan-300">
                  This bypasses Supabase auth while maintaining email verification security.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-400 mb-4">
                ✅ Security Features
              </h2>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>🔐 Secure random token generation (32 bytes)</li>
                <li>⏰ Token expiration (10 minutes)</li>
                <li>🧹 Automatic cleanup of expired tokens</li>
                <li>📧 One-time use verification links</li>
                <li>🔒 No sensitive data stored permanently</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}