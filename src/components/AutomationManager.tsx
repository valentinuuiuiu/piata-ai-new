'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AutomationTask {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  results?: any;
}

export default function AutomationManager() {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/automations');
      const data = await res.json();

      if (data.success) {
        setTasks(data.tasks);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', taskId, enabled })
      });

      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, enabled } : task
        ));
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const runTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', taskId })
      });

      const data = await res.json();
      if (data.success) {
        // Update task status to running
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: 'running' } : task
        ));
      }
    } catch (err) {
      console.error('Failed to run task:', err);
    }
  };

  const initializeTasks = async () => {
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      });

      const data = await res.json();
      if (data.success) {
        loadTasks(); // Reload tasks
      }
    } catch (err) {
      console.error('Failed to initialize tasks:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '⏳';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00f0ff] mb-2">🤖 Automation Engine</h1>
          <p className="text-gray-400">Self-executing AI-powered automation scripts</p>
        </div>
        <button
          onClick={initializeTasks}
          className="px-4 py-2 bg-[#00f0ff] text-black rounded-lg font-bold hover:bg-[#00f0ff]/80 transition-colors"
        >
          Initialize Tasks
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl border border-[#00f0ff]/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{task.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)} bg-current/20`}>
                    {getStatusIcon(task.status)} {task.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{task.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => runTask(task.id)}
                  disabled={task.status === 'running'}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ▶️ Run
                </button>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.enabled}
                    onChange={(e) => toggleTask(task.id, e.target.checked)}
                    className="w-4 h-4 text-[#00f0ff] bg-gray-800 border-gray-600 rounded focus:ring-[#00f0ff] focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">Enabled</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Last Run:</span>
                <div className="text-white">
                  {task.lastRun ? new Date(task.lastRun).toLocaleString('ro-RO') : 'Never'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Next Run:</span>
                <div className="text-white">
                  {task.nextRun ? new Date(task.nextRun).toLocaleString('ro-RO') : 'Not scheduled'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Schedule:</span>
                <div className="text-white">
                  Every {(task as any).schedule || 24} hours
                </div>
              </div>
            </div>

            {task.results && (
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <h4 className="text-sm font-bold text-[#00f0ff] mb-2">Last Results:</h4>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(task.results, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Automation Tasks</h3>
          <p className="text-gray-500 mb-4">Initialize the default automation tasks to get started.</p>
          <button
            onClick={initializeTasks}
            className="px-6 py-3 bg-[#00f0ff] text-black rounded-lg font-bold hover:bg-[#00f0ff]/80 transition-colors"
          >
            🚀 Initialize Automations
          </button>
        </div>
      )}
    </div>
  );
}