
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function JulesTaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kaiStatus, setKaiStatus] = useState('🟢 Live');

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch Automation Tasks
      const { data: taskData, error: taskError } = await supabase
        .from('automation_tasks')
        .select('*')
        .order('id', { ascending: true });

      // Fetch A2A Signals
      const { data: signalData, error: signalError } = await supabase
        .from('a2a_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!taskError) setTasks(taskData || []);
      if (!signalError) setSignals(signalData || []);
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-[#00f0ff]/30 pb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent">
              JULES TASK MANAGER
            </h1>
            <p className="text-gray-400 mt-2">Sovereign Agent Orchestration Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-[#00f0ff] text-xl font-bold">{kaiStatus}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">KAI Backend Status</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Automation Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-[#ff00f0]">◈</span> AUTOMATION REGISTRY
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(task => (
                <div key={task.id} className="bg-[#1a1a2e] border border-[#00f0ff]/20 p-6 rounded-2xl hover:border-[#00f0ff]/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg group-hover:text-[#00f0ff]">{task.name}</h3>
                    <span className={`text-[10px] px-2 py-1 rounded-full ${task.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {task.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 h-8 overflow-hidden">{task.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-gray-800 pt-4">
                    <div>
                      STATUS: <span className={task.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>{task.status.toUpperCase()}</span>
                    </div>
                    <div>
                      NEXT: {task.next_run ? new Date(task.next_run).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* A2A Signals Column */}
          <div className="bg-[#0d0d1a] border-l border-[#ff00f0]/20 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#00f0ff]">
              <span>📡</span> A2A FEED
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-auto pr-2 custom-scrollbar">
              {signals.map(sig => (
                <div key={sig.id} className="text-[11px] border-b border-gray-800 pb-3 hover:bg-white/5 p-2 rounded transition-colors">
                  <div className="flex justify-between text-gray-500 mb-1">
                    <span>{sig.from_agent.toUpperCase()} ➔ {sig.to_agent ? sig.to_agent.toUpperCase() : 'BROADCAST'}</span>
                    <span>{new Date(sig.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[#ff00f0] font-bold mb-1">{sig.signal_type}</div>
                  <pre className="text-gray-400 truncate cursor-help" title={JSON.stringify(sig.content, null, 2)}>
                    {JSON.stringify(sig.content)}
                  </pre>
                </div>
              ))}
              {signals.length === 0 && <div className="text-gray-600 text-center py-12 italic">Waiting for signals...</div>}
            </div>
          </div>
        </div>

        {/* System Logs Bottom Bar */}
        <footer className="mt-12 bg-[#1a1a2e] p-4 rounded-xl border border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
          <div className="flex gap-6">
            <span>UPTIME: 124:32:11</span>
            <span>MEMORY: 42%</span>
            <span>CPU: 12%</span>
          </div>
          <div className="text-right italic">"The Nile flows as intended, Tamose." - Taita</div>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff00f0; }
      `}</style>
    </div>
  );
}
