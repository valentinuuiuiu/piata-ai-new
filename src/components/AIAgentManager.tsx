'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export default function AIAgentManager() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<AgentTask['priority']>('medium');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'tools' | 'patterns'>('tasks');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, toolsRes] = await Promise.all([
        fetch('/api/agent/tasks'),
        fetch('/api/agent/tools')
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        setTools(toolsData.tools || []);
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
          <h1 className="text-3xl font-bold text-[#00f0ff] mb-2">🤖 AI Agent Control Center</h1>
          <p className="text-gray-400">Autonomous AI agent with advanced tools and self-executing patterns</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#ff00f0]">{tasks.length}</div>
          <div className="text-sm text-gray-400">Active Tasks</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'tasks', label: 'Tasks', icon: '📋' },
          { id: 'tools', label: 'Tools', icon: '🔧' },
          { id: 'patterns', label: 'Patterns', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#00f0ff] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Create New Task */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-[#00f0ff] mb-4">Create New Task</h3>
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