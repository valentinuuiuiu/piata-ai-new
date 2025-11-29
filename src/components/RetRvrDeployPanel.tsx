'use client'

import { useState } from 'react'

/**
 * RETRVR Deployment Panel
 * "I'll be damned if I would move a finger" - Edition
 *
 * The agent does EVERYTHING:
 * - GitHub repo creation
 * - Vercel deployment
 * - Supabase migration
 * - You just watch and sip coffee ☕
 */
export default function RetRvrDeployPanel() {
  const [githubToken, setGithubToken] = useState('')
  const [vercelToken, setVercelToken] = useState('')
  const [supabaseToken, setSupabaseToken] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFullDeploy = async () => {
    if (!githubToken || !vercelToken || !supabaseToken) {
      setError('All tokens are required!')
      return
    }

    setDeploying(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/retrvr/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'full_deploy',
          config: {
            githubToken,
            vercelToken,
            supabaseToken,
            repoName: 'piata-ai-marketplace',
            projectName: 'piata-ai',
            projectRef: 'oikhfoaltormcigauobs'
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Deployment failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setDeploying(false)
    }
  }

  const handleIndividualDeploy = async (action: string) => {
    setDeploying(true)
    setError(null)

    try {
      const config: any = {}

      if (action === 'setup_github') config.githubToken = githubToken
      if (action === 'setup_vercel') config.vercelToken = vercelToken
      if (action === 'deploy_supabase') config.supabaseToken = supabaseToken

      const response = await fetch('/api/retrvr/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, config })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Action failed')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-black to-blue-900 rounded-xl border border-cyan-500 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
          RETRVR Agent Deploy
        </h1>
        <p className="text-cyan-300 text-sm">
          "I'll be damned if I would move a finger" - The agent does it all! 🚀
        </p>
      </div>

      {/* Token Inputs */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-cyan-400 mb-2 text-sm font-semibold">
            GitHub Personal Access Token (PAT)
          </label>
          <input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
          />
          <a
            href="https://github.com/settings/tokens/new?scopes=repo,workflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block"
          >
            → Create GitHub Token
          </a>
        </div>

        <div>
          <label className="block text-purple-400 mb-2 text-sm font-semibold">
            Vercel API Token
          </label>
          <input
            type="password"
            value={vercelToken}
            onChange={(e) => setVercelToken(e.target.value)}
            placeholder="xxxxxxxxxx"
            className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none"
          />
          <a
            href="https://vercel.com/account/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block"
          >
            → Create Vercel Token
          </a>
        </div>

        <div>
          <label className="block text-green-400 mb-2 text-sm font-semibold">
            Supabase Access Token
          </label>
          <input
            type="password"
            value={supabaseToken}
            onChange={(e) => setSupabaseToken(e.target.value)}
            placeholder="sbp_xxxxxxxxxxxx"
            className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:border-green-400 focus:outline-none"
          />
          <a
            href="https://app.supabase.com/account/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-400 hover:text-green-300 mt-1 inline-block"
          >
            → Create Supabase Token
          </a>
        </div>
      </div>

      {/* Deploy Buttons */}
      <div className="space-y-4">
        <button
          onClick={handleFullDeploy}
          disabled={deploying}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {deploying ? '🚀 Deploying... Agent is working!' : '🚀 FULL AUTONOMOUS DEPLOY (Don\'t lift a finger!)'}
        </button>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleIndividualDeploy('setup_github')}
            disabled={deploying || !githubToken}
            className="py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 text-white rounded-lg text-sm"
          >
            GitHub Only
          </button>
          <button
            onClick={() => handleIndividualDeploy('setup_vercel')}
            disabled={deploying || !vercelToken}
            className="py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white rounded-lg text-sm"
          >
            Vercel Only
          </button>
          <button
            onClick={() => handleIndividualDeploy('deploy_supabase')}
            disabled={deploying || !supabaseToken}
            className="py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white rounded-lg text-sm"
          >
            Supabase Only
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
          <p className="text-red-400 font-semibold">❌ Error:</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-6 p-6 bg-green-900/30 border border-green-500 rounded-lg">
          <p className="text-green-400 font-bold text-lg mb-2">✅ {result.message}</p>

          {result.results && (
            <div className="space-y-3 mt-4">
              {result.results.github && (
                <div className="bg-black/50 p-3 rounded">
                  <p className="text-cyan-400 font-semibold">GitHub:</p>
                  <a
                    href={result.results.github.data?.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 text-sm hover:underline"
                  >
                    {result.results.github.data?.repo_url}
                  </a>
                </div>
              )}

              {result.results.vercel && (
                <div className="bg-black/50 p-3 rounded">
                  <p className="text-purple-400 font-semibold">Vercel:</p>
                  <a
                    href={result.results.vercel.data?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 text-sm hover:underline"
                  >
                    {result.results.vercel.data?.url}
                  </a>
                </div>
              )}

              {result.results.supabase && (
                <div className="bg-black/50 p-3 rounded">
                  <p className="text-green-400 font-semibold">Supabase:</p>
                  <p className="text-green-300 text-sm">
                    {result.results.supabase.data?.message}
                  </p>
                </div>
              )}
            </div>
          )}

          {result.next_steps && (
            <div className="mt-4 pt-4 border-t border-green-500/30">
              <p className="text-green-400 font-semibold mb-2">Next Steps:</p>
              <ul className="space-y-1">
                {result.next_steps.map((step: string, i: number) => (
                  <li key={i} className="text-green-300 text-sm">
                    {i + 1}. {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-xs">
          Rise until the lambs became ships 🐑➡️⛵
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Engineering the human mind - No finger lifting required
        </p>
      </div>
    </div>
  )
}
