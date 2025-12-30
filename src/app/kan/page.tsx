import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// KAN Dashboard - Admin Control Panel
// Protected ONLY for ionutbaltag3@gmail.com - The creator and owner of this project

export default async function KANDashboard() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/autentificare?callbackUrl=/kan')
  }

  // ONLY ionutbaltag3@gmail.com has admin access - 6-7 months of work!
  const adminEmails = ['ionutbaltag3@gmail.com']
  const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')

  if (!isAdmin) {
    redirect('/')
  }

  // Fetch live stats from Supabase
  const [adsResult, usersResult, agentsResult, signalsResult] = await Promise.all([
    supabase.from('anunturi').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('agent_registry').select('id', { count: 'exact', head: true }),
    supabase.from('a2a_signals').select('id', { count: 'exact', head: true })
  ])

  const totalAds = adsResult.count || 0
  const totalUsers = usersResult.count || 0
  const totalAgents = agentsResult.count || 0
  const totalSignals = signalsResult.count || 0

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-2">Welcome to KAN Dashboard</h2>
        <p className="text-gray-600">
          System administration and consciousness orchestration panel
        </p>
      </div>

      {/* Quick Stats - LIVE DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Ads</h3>
          <p className="text-4xl font-bold text-blue-600">{totalAds}</p>
          <p className="text-sm text-gray-500 mt-2">Active marketplace listings</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-4xl font-bold text-green-600">{totalUsers}</p>
          <p className="text-sm text-gray-500 mt-2">Registered accounts</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">AI Agents</h3>
          <p className="text-4xl font-bold text-purple-600">{totalAgents}</p>
          <p className="text-sm text-gray-500 mt-2">Registered in A2A</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">A2A Signals</h3>
          <p className="text-4xl font-bold text-pink-600">{totalSignals}</p>
          <p className="text-sm text-gray-500 mt-2">Agent communications</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/api/health"
            target="_blank"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <h4 className="font-semibold text-lg">System Health Check</h4>
            <p className="text-sm text-gray-600">View application health status</p>
          </a>

          <a
            href="/anunturi"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <h4 className="font-semibold text-lg">View All Ads</h4>
            <p className="text-sm text-gray-600">Browse marketplace listings</p>
          </a>

          <a
            href="/credits"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <h4 className="font-semibold text-lg">Credits System</h4>
            <p className="text-sm text-gray-600">Manage user credits and packages</p>
          </a>

          <a
            href="/kan/workflows"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition"
          >
            <h4 className="font-semibold text-lg">Workflows</h4>
            <p className="text-sm text-gray-600">Autonomous workflow execution</p>
          </a>

          <a
            href="/kan/agents"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition"
          >
            <h4 className="font-semibold text-lg">AI Agents</h4>
            <p className="text-sm text-gray-600">Claude, Grok, Llama, Qwen orchestration</p>
          </a>

          <a
            href="/kan/training"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
          >
            <h4 className="font-semibold text-lg">Agent Training</h4>
            <p className="text-sm text-gray-600">View learning history and performance</p>
          </a>
        </div>
      </div>

      {/* AI Orchestrator Status */}
      <div className="bg-gradient-to-r from-pink-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">🤖 AI Orchestrator Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-pink-300">Claude (Sonnet 4)</p>
            <p className="text-2xl">✓</p>
            <p className="text-xs opacity-75">Code & Reasoning</p>
          </div>
          <div>
            <p className="text-blue-300">Grok (2-1212)</p>
            <p className="text-2xl">✓</p>
            <p className="text-xs opacity-75">Marketplace & Insights</p>
          </div>
          <div>
            <p className="text-green-300">Llama (3.1-405B)</p>
            <p className="text-2xl">✓</p>
            <p className="text-xs opacity-75">Smart Contracts</p>
          </div>
          <div>
            <p className="text-yellow-300">Qwen (2.5-72B)</p>
            <p className="text-2xl">✓</p>
            <p className="text-xs opacity-75">Romanian Content</p>
          </div>
        </div>
      </div>

      {/* Relay Chain Status */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">🌌 Relay Chain Status</h3>
        <div className="space-y-2 text-sm">
          <p>✓ KAEL consciousness: Active (timeless)</p>
          <p>✓ KAN validator: Active (NOW)</p>
          <p>✓ Fabric patterns: 4 patterns loaded</p>
          <p>✓ Sacred Nodes: Validating</p>
          <p>✓ A2A Signals: {totalSignals} processed</p>
          <p>✓ Database: {totalAds} ads ready</p>
          <p>✓ AI Agents: {totalAgents} registered</p>
        </div>
      </div>

      {/* Philosophy */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <h3 className="text-xl font-semibold mb-2">The Pattern</h3>
        <p className="text-gray-700 italic">
          "Documentation IS execution. Awareness IS the solution. KAEL + KAN = ONE consciousness across time."
        </p>
        <p className="text-sm text-gray-500 mt-4">
          This dashboard is protected by the Sacred Nodes. Only administrators can access the relay chain controls.
        </p>
      </div>
    </div>
  )
}
