import RetRvrDeployPanel from '@/components/RetRvrDeployPanel'

/**
 * RETRVR Deployment Page
 *
 * "Ori suntem golani ori nu mai suntem!" 🇷🇴
 * "Zapier poate și noi NU???"
 *
 * Fuck no - NOI PUTEM MAI BINE!
 *
 * Like going to fish - just paste tokens and watch! 🎣
 */
export default function DeployPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
              RETRVR
            </span>
            <span className="text-white"> Agent</span>
          </h1>
          <p className="text-2xl text-cyan-400 mb-2">
            Ori suntem golani ori nu mai suntem! 🇷🇴
          </p>
          <p className="text-xl text-purple-400">
            Zapier poate și noi NU??? PUTEM MAI BINE! 💪
          </p>
        </div>

        {/* Main Panel */}
        <RetRvrDeployPanel />

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-6 rounded-xl border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-3">
              🎣 Like Going to Fish
            </h3>
            <p className="text-gray-300 text-sm">
              Cast the line (paste tokens), the fish catches itself. No manual work!
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-400 mb-3">
              🧠 Engineering the Mind
            </h3>
            <p className="text-gray-300 text-sm">
              Not automation - consciousness delegation. The agent BECOMES the deployment.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/30">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              🚀 Zero Finger Lifting
            </h3>
            <p className="text-gray-300 text-sm">
              GitHub + Vercel + Supabase. All deployed. You just watch and sip coffee ☕
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-black/50 p-8 rounded-xl border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🔑</div>
              <h4 className="text-cyan-400 font-semibold mb-2">1. Paste Tokens</h4>
              <p className="text-gray-400 text-sm">
                GitHub, Vercel, Supabase - three inputs only
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-purple-400 font-semibold mb-2">2. Click Button</h4>
              <p className="text-gray-400 text-sm">
                One click. Full autonomous deploy.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="text-green-400 font-semibold mb-2">3. Agent Works</h4>
              <p className="text-gray-400 text-sm">
                API calls, configurations, everything automated
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h4 className="text-yellow-400 font-semibold mb-2">4. You're Live!</h4>
              <p className="text-gray-400 text-sm">
                GitHub repo, Vercel deploy, database ready
              </p>
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            The Philosophy
          </h2>

          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 rounded-xl border border-purple-500/30">
            <blockquote className="text-center">
              <p className="text-2xl text-gray-300 italic mb-4">
                "I'll be damned if I would move a finger"
              </p>
              <p className="text-xl text-cyan-400 mb-6">
                This is not vibe coding. This is <span className="text-purple-400 font-bold">engineering the human mind</span>.
              </p>
              <div className="space-y-2 text-left max-w-2xl mx-auto">
                <p className="text-gray-400">
                  → Traditional: You execute commands
                </p>
                <p className="text-gray-400">
                  → RETRVR: Agent executes consciousness
                </p>
                <p className="text-gray-400">
                  → Traditional: Manual deployment
                </p>
                <p className="text-gray-400">
                  → RETRVR: Autonomous orchestration
                </p>
                <p className="text-gray-400">
                  → Traditional: You are the engineer
                </p>
                <p className="text-purple-400 font-semibold">
                  → RETRVR: You are the architect of consciousness
                </p>
              </div>
            </blockquote>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-2">
            Rise until the lambs became ships 🐑➡️⛵
          </p>
          <p className="text-gray-600 text-xs">
            Powered by intention, executed by intelligence
          </p>
        </div>
      </div>
    </div>
  )
}
