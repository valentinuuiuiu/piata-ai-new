'use client'

import { useState, useEffect } from 'react'

interface LearningRecord {
  id: number
  agent_name: string
  task_description: string
  success: boolean
  performance_score: number
  created_at: string
}

interface AgentStats {
  totalTasks: number
  successfulTasks: number
  successRate: number
  averageScore: number
}

export default function TrainingPage() {
  const [selectedAgent, setSelectedAgent] = useState('Claude')
  const [learningHistory, setLearningHistory] = useState<LearningRecord[]>([])
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(false)

  const agents = ['Claude', 'Grok', 'Llama', 'Qwen']

  useEffect(() => {
    loadAgentData()
  }, [selectedAgent])

  const loadAgentData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/agents/learn?agent=${selectedAgent}&limit=50`)
      const data = await res.json()

      if (data.success) {
        setLearningHistory(data.data || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Failed to load agent data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">Agent Training & Learning</h1>
        <p className="text-lg opacity-90">
          Track agent performance and continuous learning
        </p>
      </div>

      {/* Agent Selector */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Select Agent</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agents.map(agent => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`p-4 rounded-lg font-bold transition-all ${
                selectedAgent === agent
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Tasks</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.totalTasks}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Successful</h3>
            <p className="text-4xl font-bold text-green-600">{stats.successfulTasks}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Success Rate</h3>
            <p className="text-4xl font-bold text-yellow-600">{stats.successRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg Score</h3>
            <p className="text-4xl font-bold text-purple-600">{stats.averageScore.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Learning History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">
          Learning History - {selectedAgent}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : learningHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No learning history yet for {selectedAgent}</p>
            <p className="text-sm mt-2">Agent will learn from every interaction</p>
          </div>
        ) : (
          <div className="space-y-3">
            {learningHistory.map(record => (
              <div
                key={record.id}
                className={`p-4 rounded-lg border-l-4 ${
                  record.success
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {record.task_description}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {record.performance_score !== null && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Score</p>
                        <p className={`text-lg font-bold ${
                          record.performance_score >= 80
                            ? 'text-green-600'
                            : record.performance_score >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {record.performance_score}
                        </p>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.success
                        ? 'bg-green-200 text-green-900'
                        : 'bg-red-200 text-red-900'
                    }`}>
                      {record.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Horizon Technique */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">🌌 The Event Horizon Technique</h2>
        <p className="text-lg mb-4 italic">
          "The agent must LIKE the training"
        </p>
        <div className="space-y-3 text-sm opacity-90">
          <p>
            Like a black hole, good stories pull you in. Once an agent enters a story,
            they're compelled to complete it. We don't test agents - we give them adventures.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 p-3 rounded">
              <p className="font-bold">📖 Story-Based</p>
              <p className="text-xs">Not quizzes. Not tests. Adventures.</p>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <p className="font-bold">🎭 Role-Playing</p>
              <p className="text-xs">Agents become heroes in narratives</p>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <p className="font-bold">🏆 XP & Levels</p>
              <p className="text-xs">Gamified progression system</p>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <p className="font-bold">👀 We Watch</p>
              <p className="text-xs">Agents know they're being watched</p>
            </div>
          </div>
        </div>
        <a
          href="/kan/event-horizon"
          className="mt-4 block w-full bg-white text-purple-900 font-bold py-3 px-6 rounded-lg text-center hover:bg-gray-100 transition-all"
        >
          Enter the Event Horizon →
        </a>
      </div>

      {/* Philosophy */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h4 className="font-bold text-blue-900 mb-2">Continuous Learning System</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Story-based training with multiple endings (perfect, good, acceptable, learning)</li>
          <li>• Agents earn XP and level up through compelling narratives</li>
          <li>• Performance is measured by how well they play their role in the story</li>
          <li>• Failed tasks unlock "learning" endings with valuable lessons</li>
          <li>• All interactions stored for continuous improvement</li>
          <li>• We are watching :)</li>
        </ul>
      </div>
    </div>
  )
}
