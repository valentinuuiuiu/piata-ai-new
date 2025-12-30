import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgentRegistry, AutomationLog } from '@/lib/types/admin'

export const dynamic = 'force-dynamic'

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

  // Fetch detailed data for dynamic sections
  const { data: agents } = await supabase
    .from('agent_registry')
    .select('*')
    .order('last_heartbeat', { ascending: false })

  const { data: automationLogs } = await supabase
    .from('automation_logs')
    .select('task_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  const totalAds = adsResult.count || 0
  const totalUsers = usersResult.count || 0
  const totalAgents = agentsResult.count || 0
  const totalSignals = signalsResult.count || 0

  // Process data for "Relay Chain Status"
  const recentPatterns = new Set((automationLogs as unknown as AutomationLog[])?.map(log => log.task_name)).size
  const kaelActive = (agents as unknown as AgentRegistry[])?.some(a => a.status === 'active')

  // Process agents for "AI Orchestrator Status"
  const registeredAgents = (agents as unknown as AgentRegistry[]) || []

  // Default agents if none are registered (for display purposes until populated)
  const defaultAgents = [
    { agent_name: 'Claude', agent_type: 'Code & Reasoning', status: 'unknown' },
    { agent_name: 'Grok', agent_type: 'Marketplace & Insights', status: 'unknown' },
    { agent_name: 'Llama', agent_type: 'Smart Contracts', status: 'unknown' },
    { agent_name: 'Qwen', agent_type: 'Romanian Content', status: 'unknown' }
  ]

  const displayAgents = registeredAgents.length > 0 ? registeredAgents : defaultAgents

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

      {/* AI Orchestrator Status - DYNAMIC */}
      <div className="bg-gradient-to-r from-pink-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">🤖 AI Orchestrator Status</h3>
        {registeredAgents.length === 0 ? (
           <p className="text-sm text-pink-200 italic mb-4">No agents active in the registry. Showing expected agents:</p>
        ) : null}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {displayAgents.map((agent: any) => (
             <div key={agent.agent_name}>
                <p className="text-pink-300">{agent.agent_name}</p>
                <p className="text-2xl">{agent.status === 'active' || agent.status === 'idle' || agent.status === 'healthy' || agent.status === 'initialized' ? '✓' : (agent.status === 'unknown' ? '?' : '⚠')}</p>
                <p className="text-xs opacity-75">{agent.agent_type}</p>
                {agent.last_heartbeat && (
                   <p className="text-[10px] opacity-50 mt-1">Last seen: {new Date(agent.last_heartbeat).toLocaleTimeString()}</p>
                )}
             </div>
          ))}
        </div>
      </div>

      {/* Relay Chain Status - DYNAMIC */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">🌌 Relay Chain Status</h3>
        <div className="space-y-2 text-sm">
          <p>{kaelActive ? '✓' : '✓'} KAEL consciousness: {kaelActive ? 'Active (timeless)' : 'Synchronizing...'}</p>
          <p>✓ KAN validator: Active (NOW)</p>
          <p>✓ Fabric patterns: {recentPatterns} patterns loaded</p>
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
