/**
 * 🧠 Agent Wellbeing Dashboard
 * Unified monitoring for all agents in the Piata AI ecosystem.
 * 
 * This dashboard shows:
 * - Agent health status
 * - Success/failure rates
 * - Response times
 * - Task distribution
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AgentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastHeartbeat: string;
  metrics: {
    successRate: number;
    avgResponseTime: number;
    tasksCompleted: number;
    tasksFailed: number;
  };
}

interface TaskStats {
  totalTasks: number;
  successRate: number;
  avgDuration: number;
  agentDistribution: Record<string, number>;
}

export default function AgentWellbeingDashboard() {
  const [agents, setAgents] = useState<AgentHealth[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAgentData = async () => {
    try {
      const [healthRes, statsRes] = await Promise.all([
        fetch('/api/admin/agent-health'),
        fetch('/api/admin/agent-stats')
      ]);

      if (healthRes.ok) {
        setAgents(await healthRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✓';
      case 'degraded': return '⚠';
      case 'down': return '✗';
      default: return '?';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const agentsByTier = {
    openrouter: agents.filter(a => 
      ['KATE', 'GROK', 'CLAUDE', 'QWEN'].includes(a.name)
    ),
    mcp: agents.filter(a => 
      ['STRIPE', 'REDIS', 'GITHUB', 'SUPABASE', 'SHEETS'].includes(a.name)
    )
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-purple-400">Loading agent health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 Agent Wellbeing Dashboard
          </h1>
          <p className="text-purple-400">
            Unified monitoring for all Piata AI agents. Focus on health, not quantity.
          </p>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <motion.div 
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-gray-400 text-sm mb-1">Total Tasks</div>
              <div className="text-3xl font-bold text-white">{stats.totalTasks}</div>
            </motion.div>
            <motion.div 
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-gray-400 text-sm mb-1">Success Rate</div>
              <div className="text-3xl font-bold text-green-400">
                {(stats.successRate * 100).toFixed(1)}%
              </div>
            </motion.div>
            <motion.div 
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-gray-400 text-sm mb-1">Avg Duration</div>
              <div className="text-3xl font-bold text-blue-400">
                {stats.avgDuration.toFixed(0)}ms
              </div>
            </motion.div>
            <motion.div 
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-gray-400 text-sm mb-1">Active Agents</div>
              <div className="text-3xl font-bold text-purple-400">
                {agents.filter(a => a.status === 'healthy').length}/{agents.length}
              </div>
            </motion.div>
          </div>
        )}

        {/* OpenRouter Agents */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span> OpenRouter Agents
            <span className="text-sm font-normal text-gray-400 ml-2">
              (LLM Intelligence)
            </span>
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {agentsByTier.openrouter.map((agent, index) => (
              <motion.div
                key={agent.name}
                className={`bg-gray-800/50 rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedAgent === agent.name 
                    ? 'border-purple-500 ring-2 ring-purple-500/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedAgent(agent.name)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-white">{agent.name}</span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <span>{getStatusIcon(agent.status)}</span>
                  <span className="capitalize">{agent.status}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Success Rate</span>
                    <span className={agent.metrics.successRate > 0.9 ? 'text-green-400' : 
                                    agent.metrics.successRate > 0.7 ? 'text-yellow-400' : 'text-red-400'}>
                      {(agent.metrics.successRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Response</span>
                    <span className="text-blue-400">{agent.metrics.avgResponseTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tasks</span>
                    <span className="text-white">{agent.metrics.tasksCompleted}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* MCP Tool Agents */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔧</span> MCP Tool Agents
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Infrastructure & Services)
            </span>
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {agentsByTier.mcp.map((agent, index) => (
              <motion.div
                key={agent.name}
                className={`bg-gray-800/50 rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedAgent === agent.name 
                    ? 'border-purple-500 ring-2 ring-purple-500/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedAgent(agent.name)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-white">{agent.name}</span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <span>{getStatusIcon(agent.status)}</span>
                  <span className="capitalize">{agent.status}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Success</span>
                    <span className={agent.metrics.successRate > 0.9 ? 'text-green-400' : 
                                    agent.metrics.successRate > 0.7 ? 'text-yellow-400' : 'text-red-400'}>
                      {(agent.metrics.successRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tasks</span>
                    <span className="text-white">{agent.metrics.tasksCompleted}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Agent Distribution Chart */}
        {stats && Object.keys(stats.agentDistribution).length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Task Distribution
            </h2>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="space-y-4">
                {Object.entries(stats.agentDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([agent, count]) => {
                    const percentage = (count / stats.totalTasks) * 100;
                    return (
                      <div key={agent}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{agent}</span>
                          <span className="text-gray-400">{count} tasks ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* Agent Wellbeing Philosophy */}
        <section>
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💚</span> Agent Wellbeing Philosophy
            </h3>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">🎯 Single Responsibility</h4>
                <p className="text-gray-400">
                  Each agent has one clear purpose. KATE codes, GROK automates, STRIPE handles payments.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">🛡️ Graceful Degradation</h4>
                <p className="text-gray-400">
                  Agents have fallbacks. If one fails, others can take over. Health is continuously monitored.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">📈 Continuous Learning</h4>
                <p className="text-gray-400">
                  Success/failure metrics are recorded. Agents learn from interactions and improve over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">
            Using <span className="text-purple-400">KAEL v2.0</span> Unified Orchestrator
          </p>
        </div>
      </div>
    </div>
  );
}