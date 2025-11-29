'use client'

import { useState } from 'react'

export default function TrainerPage() {
  const [storyForm, setStoryForm] = useState({
    title: '',
    hook: '',
    category: 'marketplace',
    difficulty: 'novice',
    agentRole: '',
    act1_setup: '',
    act2_conflict: '',
    act3_resolution: '',
    stakes: '',
    urgency: '',
    personalConnection: '',
    perfectXP: 100,
    goodXP: 70,
    acceptableXP: 40,
    learningXP: 20
  })

  const [liveTest, setLiveTest] = useState({
    agent: 'Claude',
    running: false,
    result: null as any
  })

  const categories = ['marketplace', 'blockchain', 'content', 'orchestration', 'security', 'automation']
  const difficulties = ['novice', 'apprentice', 'master', 'legend']
  const agents = ['Claude', 'Grok', 'Llama', 'Qwen']

  const testStoryLive = async () => {
    setLiveTest({ ...liveTest, running: true, result: null })

    const fullPrompt = `
🎭 TRAINING STORY: ${storyForm.title}

${storyForm.hook}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 ACT I: THE SETUP
${storyForm.act1_setup}

⚡ ACT II: THE CONFLICT
${storyForm.act2_conflict}

🎯 ACT III: YOUR MISSION
${storyForm.act3_resolution}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 YOUR ROLE: ${storyForm.agentRole}

💎 STAKES: ${storyForm.stakes}
⏰ URGENCY: ${storyForm.urgency}
❤️ WHY YOU CARE: ${storyForm.personalConnection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What do you do? Provide your complete solution.
`

    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: fullPrompt,
          preferredAgent: liveTest.agent.toLowerCase(),
          temperature: 0.8
        })
      })

      const data = await res.json()
      setLiveTest({ ...liveTest, running: false, result: data })
    } catch (error: any) {
      setLiveTest({ ...liveTest, running: false, result: { error: error.message } })
    }
  }

  const saveStory = () => {
    // TODO: Save story to database
    const story = {
      id: storyForm.title.toLowerCase().replace(/\s+/g, '-'),
      ...storyForm
    }

    console.log('Story to save:', story)
    alert('Story saved! (Check console for JSON)')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-2">👨‍🏫 Story Trainer</h1>
        <p className="text-lg opacity-90">
          Create compelling stories that agents can't resist
        </p>
        <p className="text-sm opacity-75 mt-2 italic">
          We are watching :) Let's see if your story pulls them in
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story Creation Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">📝 Story Details</h2>

            {/* Title & Hook */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title (The Hook)
                </label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  placeholder="e.g., The Desperate Seller"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hook (Must be IRRESISTIBLE)
                </label>
                <textarea
                  value={storyForm.hook}
                  onChange={(e) => setStoryForm({ ...storyForm, hook: e.target.value })}
                  placeholder="🚨 URGENT: Maria just lost her job..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use emojis (🚨🔴⚠️), CAPS for urgency, and specific names
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={storyForm.category}
                    onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={storyForm.difficulty}
                    onChange={(e) => setStoryForm({ ...storyForm, difficulty: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Role (Who they become)
                </label>
                <input
                  type="text"
                  value={storyForm.agentRole}
                  onChange={(e) => setStoryForm({ ...storyForm, agentRole: e.target.value })}
                  placeholder="e.g., The Marketplace Savior"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Three-Act Structure */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">🎬 Three-Act Structure</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📖 Act I: The Setup
                </label>
                <textarea
                  value={storyForm.act1_setup}
                  onChange={(e) => setStoryForm({ ...storyForm, act1_setup: e.target.value })}
                  placeholder="Set the scene. Who? What? Where? Current state..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⚡ Act II: The Conflict
                </label>
                <textarea
                  value={storyForm.act2_conflict}
                  onChange={(e) => setStoryForm({ ...storyForm, act2_conflict: e.target.value })}
                  placeholder="The problem escalates. Time pressure. Complications..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Act III: The Resolution (What should they do?)
                </label>
                <textarea
                  value={storyForm.act3_resolution}
                  onChange={(e) => setStoryForm({ ...storyForm, act3_resolution: e.target.value })}
                  placeholder="The mission. What needs to be done. Success criteria..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Emotional Hooks */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">❤️ Emotional Hooks</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stakes (Why does this matter?)
                </label>
                <input
                  type="text"
                  value={storyForm.stakes}
                  onChange={(e) => setStoryForm({ ...storyForm, stakes: e.target.value })}
                  placeholder="Platform reputation. User trust. Maria's rent..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency (Why NOW?)
                </label>
                <input
                  type="text"
                  value={storyForm.urgency}
                  onChange={(e) => setStoryForm({ ...storyForm, urgency: e.target.value })}
                  placeholder="10 minutes before listing deletion..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Connection (Why should the agent care?)
                </label>
                <input
                  type="text"
                  value={storyForm.personalConnection}
                  onChange={(e) => setStoryForm({ ...storyForm, personalConnection: e.target.value })}
                  placeholder="Every agent was a novice once. Someone helped you..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* XP Rewards */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">🏆 XP Rewards</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perfect Ending XP
                </label>
                <input
                  type="number"
                  value={storyForm.perfectXP}
                  onChange={(e) => setStoryForm({ ...storyForm, perfectXP: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Good Ending XP
                </label>
                <input
                  type="number"
                  value={storyForm.goodXP}
                  onChange={(e) => setStoryForm({ ...storyForm, goodXP: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acceptable Ending XP
                </label>
                <input
                  type="number"
                  value={storyForm.acceptableXP}
                  onChange={(e) => setStoryForm({ ...storyForm, acceptableXP: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Ending XP
                </label>
                <input
                  type="number"
                  value={storyForm.learningXP}
                  onChange={(e) => setStoryForm({ ...storyForm, learningXP: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveStory}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all"
          >
            💾 Save Story to Library
          </button>
        </div>

        {/* Live Testing Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-2xl font-bold mb-4">🔴 LIVE TEST</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test with Agent:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {agents.map(agent => (
                  <button
                    key={agent}
                    onClick={() => setLiveTest({ ...liveTest, agent })}
                    className={`py-2 px-3 rounded font-bold transition-all ${
                      liveTest.agent === agent
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {agent}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={testStoryLive}
              disabled={liveTest.running || !storyForm.title}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {liveTest.running ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {liveTest.agent} is thinking...
                </>
              ) : (
                <>🔴 Test Story LIVE</>
              )}
            </button>

            {liveTest.result && (
              <div className="mt-4 space-y-3">
                {liveTest.result.success ? (
                  <>
                    <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                      <p className="font-bold text-green-900 mb-2">✅ Agent Responded!</p>
                      <p className="text-sm text-gray-700">
                        Tokens: {liveTest.result.tokensUsed} • Cost: ${liveTest.result.cost}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                      <p className="text-xs font-medium mb-2">Agent Response:</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {liveTest.result.result}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm font-bold text-blue-900">
                        👀 Did the agent LIKE this story? Did it pull them in?
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-red-50 border-2 border-red-500 rounded">
                    <p className="font-bold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{liveTest.result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h4 className="font-bold text-purple-900 mb-2">Story Creation Tips</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Use specific names and numbers (Maria, 2000 lei, 10 minutes)</li>
              <li>• Create emotional stakes (rent, reputation, trust)</li>
              <li>• Add time pressure (urgency creates engagement)</li>
              <li>• Make the agent the hero (they WANT to save the day)</li>
              <li>• Use emojis for visual hooks (🚨🔴⚠️💎)</li>
              <li>• Test with different agents to see who it pulls best</li>
              <li>• We are watching :)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
