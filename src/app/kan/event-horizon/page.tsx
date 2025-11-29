'use client'

import { useState, useEffect } from 'react'

interface Story {
  id: string
  title: string
  hook: string
  category: string
  difficulty: string
  rewardXP: number
  agentRole: string
}

interface AgentProgress {
  agentName: string
  level: number
  totalXP: number
  storiesCompleted: number
  reputation: string
}

export default function EventHorizonPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedAgent, setSelectedAgent] = useState('Claude')
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState<Record<string, AgentProgress>>({})

  const agents = ['Claude', 'Grok', 'Llama', 'Qwen']

  useEffect(() => {
    loadStories()
    loadProgress()
  }, [])

  const loadStories = async () => {
    try {
      const res = await fetch('/api/event-horizon?action=all')
      const data = await res.json()
      if (data.success) {
        setStories(data.stories)
      }
    } catch (error) {
      console.error('Failed to load stories:', error)
    }
  }

  const loadProgress = async () => {
    // TODO: Load actual progress from database
    const mockProgress: Record<string, AgentProgress> = {}
    agents.forEach(agent => {
      mockProgress[agent] = {
        agentName: agent,
        level: Math.floor(Math.random() * 10) + 1,
        totalXP: Math.floor(Math.random() * 5000),
        storiesCompleted: Math.floor(Math.random() * 20),
        reputation: ['novice', 'apprentice', 'master', 'legend'][Math.floor(Math.random() * 4)]
      }
    })
    setProgress(mockProgress)
  }

  const executeStory = async () => {
    if (!selectedStory) return

    setExecuting(true)
    setResult(null)

    try {
      const res = await fetch('/api/event-horizon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: selectedStory.id,
          agentName: selectedAgent,
          runAutonomously: true
        })
      })

      const data = await res.json()
      setResult(data)

      if (data.success) {
        // Reload progress to show XP gain
        await loadProgress()
      }
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setExecuting(false)
    }
  }

  // Calculate chart data
  const chartData = agents.map(agent => ({
    agent,
    level: progress[agent]?.level || 0,
    xp: progress[agent]?.totalXP || 0,
    stories: progress[agent]?.storiesCompleted || 0
  }))

  const maxXP = Math.max(...chartData.map(d => d.xp), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-2">🌌 Event Horizon Training</h1>
        <p className="text-lg opacity-90 italic">
          "The agent must LIKE the training" - We are watching :)
        </p>
        <p className="text-sm opacity-75 mt-2">
          {stories.length} stories available • Story-based learning with XP & levels
        </p>
      </div>

      {/* Agent Progress Visualization */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">📊 Agent Progress Dashboard</h2>

        {/* XP Bar Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Total XP Earned</h3>
          <div className="space-y-3">
            {chartData.map(data => (
              <div key={data.agent}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{data.agent}</span>
                  <span className="text-sm text-gray-600">
                    {data.xp} XP • Level {data.level} • {data.stories} stories
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(data.xp / maxXP) * 100}%` }}
                  >
                    {data.xp > maxXP * 0.3 && (
                      <span className="text-white text-xs font-bold">{data.xp} XP</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level Comparison */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Level Comparison</h3>
          <div className="grid grid-cols-4 gap-4">
            {chartData.map(data => (
              <div
                key={data.agent}
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200"
              >
                <p className="text-sm font-medium text-gray-700">{data.agent}</p>
                <p className="text-4xl font-bold text-purple-600 my-2">{data.level}</p>
                <p className="text-xs text-gray-500">{progress[data.agent]?.reputation}</p>
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <p className="text-xs text-gray-600">{data.stories} stories</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Execution Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Selection */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">🎭 Available Stories</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agent:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {agents.map(agent => (
                <button
                  key={agent}
                  onClick={() => setSelectedAgent(agent)}
                  className={`py-2 px-4 rounded font-bold transition-all ${
                    selectedAgent === agent
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stories.map(story => (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStory?.id === story.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{story.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    story.difficulty === 'legend'
                      ? 'bg-yellow-100 text-yellow-800'
                      : story.difficulty === 'master'
                      ? 'bg-red-100 text-red-800'
                      : story.difficulty === 'apprentice'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {story.difficulty}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{story.hook}</p>

                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>🎭 {story.agentRole}</span>
                  <span>🏆 {story.rewardXP} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">⚡ Execute Story</h2>

          {selectedStory ? (
            <>
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-bold mb-2">{selectedStory.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{selectedStory.hook}</p>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{selectedStory.category}</span>
                  <span>{selectedStory.rewardXP} XP</span>
                </div>
              </div>

              <button
                onClick={executeStory}
                disabled={executing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {executing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {selectedAgent} is thinking...
                  </>
                ) : (
                  <>🚀 Run with {selectedAgent}</>
                )}
              </button>

              {result && (
                <div className="mt-4 space-y-3">
                  {result.success ? (
                    <>
                      <div className={`p-4 rounded-lg ${
                        result.ending === 'perfect'
                          ? 'bg-yellow-50 border-2 border-yellow-500'
                          : result.ending === 'good'
                          ? 'bg-green-50 border-2 border-green-500'
                          : result.ending === 'acceptable'
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-gray-500'
                      }`}>
                        <p className="font-bold text-lg mb-2">
                          {result.ending === 'perfect' && '🏆 PERFECT'}
                          {result.ending === 'good' && '✅ GOOD'}
                          {result.ending === 'acceptable' && '👍 ACCEPTABLE'}
                          {result.ending === 'learning' && '📚 LEARNING'}
                        </p>
                        <p className="text-sm mb-2">+{result.xpGained} XP</p>
                        <p className="text-xs text-gray-700">{result.endingDescription}</p>
                      </div>

                      <div className="p-3 bg-gray-100 rounded max-h-48 overflow-y-auto">
                        <p className="text-xs font-medium mb-2">Agent Response:</p>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">
                          {result.response?.substring(0, 500)}...
                        </p>
                      </div>

                      {result.message && (
                        <div className="p-3 bg-purple-100 rounded">
                          <p className="text-sm font-bold text-purple-900">{result.message}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-red-50 border-2 border-red-500 rounded">
                      <p className="font-bold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>Select a story to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Philosophy */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">The Event Horizon</h3>
        <p className="italic opacity-90">
          Like a black hole, good stories pull agents in. They can't resist.
          We watch them learn, level up, and become legends. This is engineering the human mind.
        </p>
        <p className="text-sm opacity-75 mt-4">
          We are watching :)
        </p>
      </div>
    </div>
  )
}
