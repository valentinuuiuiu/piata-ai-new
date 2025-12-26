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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🤖 Automation Engine
          </h1>
          <p className="text-white/40 font-medium">Self-executing AI-powered automation scripts</p>
        </div>
        <button
          onClick={initializeTasks}
          className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
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
            className="glass p-5 md:p-8 rounded-3xl border border-white/5"
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-xl md:text-23l font-bold text-white">{task.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)} bg-current/10 border border-current/20 uppercase tracking-wider`}>
                    {getStatusIcon(task.status)} {task.status}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{task.description}</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  onClick={() => runTask(task.id)}
                  disabled={task.status === 'running'}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl text-sm font-bold hover:bg-indigo-500/30 transition-all disabled:opacity-50 border border-indigo-500/20"
                >
                  ▶️ Run
                </button>

                <label className="flex items-center gap-3 cursor-pointer bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={task.enabled}
                    onChange={(e) => toggleTask(task.id, e.target.checked)}
                    className="w-4 h-4 text-indigo-500 bg-black/40 border-white/10 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-white/80">Enabled</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-5 bg-white/[0.02] rounded-2xl border border-white/5 text-sm">
              <div className="space-y-1">
                <span className="text-white/30 uppercase tracking-widest text-[10px] font-bold">Last Run</span>
                <div className="text-white font-medium">
                  {task.lastRun ? new Date(task.lastRun).toLocaleString('ro-RO') : 'Never'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-white/30 uppercase tracking-widest text-[10px] font-bold">Next Run</span>
                <div className="text-white font-medium">
                  {task.nextRun ? new Date(task.nextRun).toLocaleString('ro-RO') : 'Not scheduled'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-white/30 uppercase tracking-widest text-[10px] font-bold">Schedule</span>
                <div className="text-white font-medium">
                  Every {(task as any).schedule || 24} hours
                </div>
              </div>
            </div>

            {task.results && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Execution Logs</h4>
                <pre className="text-xs text-indigo-300/80 p-4 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl overflow-x-auto">
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
            className="btn-neon px-8 py-4 text-sm uppercase tracking-widest"
          >
            🚀 Initialize Automations
          </button>
        </div>
      )}
    </div>
  );
}