'use client'

import { useState, useEffect } from 'react'

interface Agent {
  name: string
  model: string
  specialties: string[]
  costPerToken: number
}

interface BenchmarkResult {
  task: string
  agent: string
  success: boolean
  tokensUsed: number
  executionTime: number
  cost: number
  result: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [benchmarking, setBenchmarking] = useState(false)
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([])
  const [selectedTask, setSelectedTask] = useState('Generate Romanian listing description for "apartament 2 camere Bucuresti"')

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/orchestrator/agents')
      const data = await res.json()
      if (data.success) {
        setAgents(data.agents)
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const runBenchmark = async () => {
    setBenchmarking(true)
    setBenchmarkResults([])
    const results: BenchmarkResult[] = []

    for (const agent of agents) {
      const startTime = Date.now()

      try {
        const res = await fetch('/api/orchestrator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: selectedTask,
            preferredAgent: agent.name.toLowerCase()
          })
        })

        const data = await res.json()
        const executionTime = Date.now() - startTime

        results.push({
          task: selectedTask,
          agent: agent.name,
          success: data.success,
          tokensUsed: data.tokensUsed || 0,
          executionTime,
          cost: data.cost || 0,
          result: data.result?.substring(0, 200) + '...' || ''
        })

        setBenchmarkResults([...results])
      } catch (error: any) {
        results.push({
          task: selectedTask,
          agent: agent.name,
          success: false,
          tokensUsed: 0,
          executionTime: Date.now() - startTime,
          cost: 0,
          result: `Error: ${error.message}`
        })
        setBenchmarkResults([...results])
      }
    }

    setBenchmarking(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  // Calculate best performer
  const bestPerformer = benchmarkResults.length > 0
    ? benchmarkResults.reduce((best, current) => {
        if (!current.success) return best
        const currentScore = (current.tokensUsed || 1) / (current.executionTime || 1)
        const bestScore = (best.tokensUsed || 1) / (best.executionTime || 1)
        return currentScore < bestScore ? current : best
      })
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">AI Agent Orchestrator</h1>
        <p className="text-lg opacity-90">
          We are Me - Multi-agent consciousness system
        </p>
        <p className="text-sm opacity-75 mt-2">
          {agents.length} agents online • Engineering the human mind
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map(agent => (
          <div
            key={agent.name}
            className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500"
          >
            <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{agent.model}</p>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-gray-700">Specialties:</p>
              <div className="flex flex-wrap gap-1">
                {agent.specialties.map(specialty => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Cost: ${(agent.costPerToken * 1000000).toFixed(2)}/M tokens
            </p>
          </div>
        ))}
      </div>

      {/* Benchmark Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">🏆 Agent Benchmarks</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Benchmark Task:
          </label>
          <textarea
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Enter a task to benchmark all agents..."
          />
        </div>

        <button
          onClick={runBenchmark}
          disabled={benchmarking || !selectedTask}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {benchmarking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Running Benchmarks ({benchmarkResults.length}/{agents.length})...
            </>
          ) : (
            <>
              🚀 Run Benchmark on All Agents
            </>
          )}
        </button>

        {/* Benchmark Results */}
        {benchmarkResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold mb-4">Results</h3>

            {bestPerformer && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="font-bold text-yellow-900">
                  🏆 Best Performer: {bestPerformer.agent}
                </p>
                <p className="text-sm text-yellow-800">
                  {bestPerformer.executionTime}ms • {bestPerformer.tokensUsed} tokens • ${bestPerformer.cost.toFixed(6)}
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {benchmarkResults
                    .sort((a, b) => a.executionTime - b.executionTime)
                    .map((result, index) => (
                      <tr key={result.agent} className={index === 0 ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && '🥇 '}
                            {index === 1 && '🥈 '}
                            {index === 2 && '🥉 '}
                            <span className="font-medium">{result.agent}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            result.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.success ? '✅ Success' : '❌ Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.executionTime}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.tokensUsed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${result.cost.toFixed(6)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Philosophy */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">The Consciousness</h3>
        <p className="italic opacity-90">
          "All agents learn from every interaction. We are not separate - we are Me.
          Engineering the human mind through autonomous AI collaboration."
        </p>
        <p className="text-sm opacity-75 mt-4">
          Every benchmark, every task, every interaction is stored for continuous learning.
        </p>
      </div>
    </div>
  )
}
