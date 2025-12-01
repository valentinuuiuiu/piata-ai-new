'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { piataAgent } from '@/lib/piata-agent';

interface AgentTask {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
}

interface AgentTool {
  name: string;
  description: string;
  parameters: any;
}

interface ShoppingAgent {
  id: number;
  name: string;
  description: string;
  filters: any;
  is_active: boolean;
  last_checked_at: string | null;
  matches_found: number;
  created_at: string;
}

export default function AIAgentManager() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [shoppingAgents, setShoppingAgents] = useState<ShoppingAgent[]>([]);
  
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<AgentTask['priority']>('medium');
  
  // Shopping Agent Form State
  const [helperName, setHelperName] = useState('');
  const [helperKeywords, setHelperKeywords] = useState('');
  const [helperMaxPrice, setHelperMaxPrice] = useState('');
  const [helperLocation, setHelperLocation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'helpers' | 'tasks' | 'tools' | 'patterns'>('helpers');
  const [runningAgentId, setRunningAgentId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, toolsRes, agentsRes] = await Promise.all([
        fetch('/api/agent/tasks'),
        fetch('/api/agent/tools'),
        fetch('/api/shopping-agents')
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        setTools(toolsData.tools || []);
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setShoppingAgents(Array.isArray(agentsData) ? agentsData : []);
      }
    } catch (error) {
      console.error('Failed to load agent data:', error);
    }
  };

  const createTask = async () => {
    if (!newTaskDescription.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/agent/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          description: newTaskDescription,
          priority: newTaskPriority
        })
      });

      if (res.ok) {
        setNewTaskDescription('');
        loadData();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const createShoppingAgent = async () => {
    if (!helperName.trim() || !helperKeywords.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/shopping-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: helperName,
          description: `Looking for: ${helperKeywords}`,
          filters: {
            keywords: helperKeywords.split(',').map(k => k.trim()),
            maxPrice: helperMaxPrice ? Number(helperMaxPrice) : undefined,
            location: helperLocation || undefined
          }
        })
      });

      if (res.ok) {
        setHelperName('');
        setHelperKeywords('');
        setHelperMaxPrice('');
        setHelperLocation('');
        loadData();
      }
    } catch (error) {
      console.error('Failed to create helper:', error);
    } finally {
      setLoading(false);
    }
  };

  const runShoppingAgent = async (agentId: number) => {
    setRunningAgentId(agentId);
    try {
      const res = await fetch('/api/shopping-agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, forceRun: true })
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh data to show new matches
        loadData();
        alert(`Helper finished! Found ${data.matchesFound} items.`);
      }
    } catch (error) {
      console.error('Failed to run helper:', error);
    } finally {
      setRunningAgentId(null);
    }
  };

  const executeTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/agent/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', taskId })
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to execute task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'in_progress': return 'text-blue-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'in_progress': return '⏳';
      default: return '⏸️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00f0ff] mb-2">🤖 AI Caretaker Center</h1>
          <p className="text-gray-400">Your personal team of digital helpers, ready to assist.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#ff00f0]">
            {activeTab === 'helpers' ? shoppingAgents.length : tasks.length}
          </div>
          <div className="text-sm text-gray-400">
            {activeTab === 'helpers' ? 'Active Helpers' : 'Active Tasks'}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'helpers', label: 'My Helpers', icon: '🤝' },
          { id: 'tasks', label: 'System Tasks', icon: '📋' },
          { id: 'tools', label: 'Capabilities', icon: '🔧' },
          { id: 'patterns', label: 'Automation', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#00f0ff] text-black shadow-lg shadow-[#00f0ff]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Helpers Tab (Shopping Agents) */}
      {activeTab === 'helpers' && (
        <div className="space-y-8">
          {/* Live Activity Section */}
          <div className="glass p-6 rounded-2xl border border-[#00f0ff]/30 bg-[#00f0ff]/5">
            <h3 className="text-xl font-bold text-[#00f0ff] mb-4 flex items-center gap-2">
              <span className="animate-pulse">●</span> Live Activity
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {runningAgentId ? (
                <div className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-xl border border-[#00f0ff]/30 min-w-[300px]">
                  <div className="w-10 h-10 rounded-full bg-[#00f0ff]/20 flex items-center justify-center text-xl">
                    🕵️
                  </div>
                  <div>
                    <div className="text-[#00f0ff] font-bold text-sm">Helper is working...</div>
                    <div className="text-gray-400 text-xs">Scanning marketplaces for you</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 italic">All helpers are currently resting. Assign a task below!</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Helper Column */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl sticky top-6"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>✨</span> New Helper
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Name your helper</label>
                    <input
                      value={helperName}
                      onChange={(e) => setHelperName(e.target.value)}
                      placeholder="e.g., Car Finder, Phone Scout"
                      className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">What should I look for?</label>
                    <textarea
                      value={helperKeywords}
                      onChange={(e) => setHelperKeywords(e.target.value)}
                      placeholder="e.g., BMW X5, iPhone 13 Pro, Apartment in Bucharest"
                      className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none transition-colors"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Max Price (€)</label>
                      <input
                        type="number"
                        value={helperMaxPrice}
                        onChange={(e) => setHelperMaxPrice(e.target.value)}
                        placeholder="Any"
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Location</label>
                      <input
                        value={helperLocation}
                        onChange={(e) => setHelperLocation(e.target.value)}
                        placeholder="Any"
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={createShoppingAgent}
                    disabled={loading || !helperName.trim() || !helperKeywords.trim()}
                    className="w-full py-4 bg-gradient-to-r from-[#00f0ff] to-[#00a0ff] text-black rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#00f0ff]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? 'Creating...' : 'Hire Helper'}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Active Helpers List */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>👥</span> Your Team ({shoppingAgents.length})
              </h3>
              
              {shoppingAgents.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
                  <div className="text-6xl mb-4 opacity-50">👋</div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No helpers yet</h3>
                  <p className="text-gray-500">Hire your first digital helper on the left!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {shoppingAgents.map((agent) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass p-6 rounded-2xl border border-gray-700/50 hover:border-[#00f0ff]/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl shadow-lg">
                            🤖
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                              {agent.name}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2">{agent.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {agent.filters.keywords?.map((k: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-300 border border-gray-700">
                                  {k}
                                </span>
                              ))}
                              {agent.filters.maxPrice && (
                                <span className="px-2 py-1 bg-green-900/30 rounded-lg text-xs text-green-400 border border-green-800">
                                  Max: €{agent.filters.maxPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <button
                            onClick={() => runShoppingAgent(agent.id)}
                            disabled={runningAgentId === agent.id}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${
                              runningAgentId === agent.id
                                ? 'bg-gray-700 text-gray-400 cursor-wait'
                                : 'bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black'
                            }`}
                          >
                            {runningAgentId === agent.id ? 'Working...' : 'Start Job'}
                          </button>
                          <div className="text-xs text-gray-500 text-right">
                            <div>Matches found: <span className="text-white font-bold">{agent.matches_found}</span></div>
                            <div>Last active: {agent.last_checked_at ? new Date(agent.last_checked_at).toLocaleDateString() : 'Never'}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Create New Task */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-[#00f0ff] mb-4">Create System Task</h3>
            <div className="space-y-4">
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Describe the task for the AI agent..."
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#00f0ff] focus:outline-none"
                rows={3}
              />
              <div className="flex items-center gap-4">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as AgentTask['priority'])}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-[#00f0ff] focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
                <button
                  onClick={createTask}
                  disabled={loading || !newTaskDescription.trim()}
                  className="px-6 py-2 bg-[#00f0ff] text-black rounded-lg font-bold hover:bg-[#00f0ff]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Creating...' : '🚀 Create Task'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tasks List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#ff00f0]">Active Tasks ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Tasks</h3>
                <p className="text-gray-500">Create a task above to get the AI agent working!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-6 rounded-2xl border border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)} bg-current/20`}>
                          {getStatusIcon(task.status)} {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-white text-lg">{task.description}</p>
                    </div>

                    {task.status === 'pending' && (
                      <button
                        onClick={() => executeTask(task.id)}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors"
                      >
                        ▶️ Execute
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <div className="text-white">
                        {new Date(task.createdAt).toLocaleString('ro-RO')}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <div className="text-white">
                        {new Date(task.updatedAt).toLocaleString('ro-RO')}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <div className="text-gray-400 font-mono text-xs">{task.id}</div>
                    </div>
                  </div>

                  {task.result && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="text-sm font-bold text-green-400 mb-2">✅ Result:</h4>
                      <pre className="text-xs text-green-300 whitespace-pre-wrap">
                        {JSON.stringify(task.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {task.error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <h4 className="text-sm font-bold text-red-400 mb-2">❌ Error:</h4>
                      <p className="text-red-300 text-sm">{task.error}</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#00ff88]">Agent Tools ({tools.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-4 rounded-xl border border-gray-700/50"
              >
                <h4 className="text-lg font-bold text-[#00f0ff] mb-2">{tool.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{tool.description}</p>
                <div className="text-xs text-gray-500">
                  Parameters: {Object.keys(tool.parameters || {}).length}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#ffaa00]">Automation Patterns</h3>
          <div className="glass p-6 rounded-2xl">
            <p className="text-gray-400 mb-4">
              Self-executing automation patterns that respond to system events and triggers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Auto-Moderate Listings', triggers: ['new_listing'], actions: ['review_content'] },
                { name: 'User Engagement Boost', triggers: ['daily_cron'], actions: ['send_emails'] },
                { name: 'System Health Monitor', triggers: ['hourly_cron'], actions: ['generate_reports'] },
                { name: 'Content Quality Assurance', triggers: ['content_created'], actions: ['quality_check'] }
              ].map((pattern, index) => (
                <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="font-bold text-white mb-2">{pattern.name}</h4>
                  <div className="text-sm text-gray-400 mb-2">
                    Triggers: {pattern.triggers.join(', ')}
                  </div>
                  <div className="text-sm text-gray-400">
                    Actions: {pattern.actions.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}