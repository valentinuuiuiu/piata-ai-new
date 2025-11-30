'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShoppingAgent } from '@/lib/shopping-agent-runner';

export default function ShoppingAgentsPage() {
  const [agents, setAgents] = useState<ShoppingAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view your shopping agents');
        return;
      }

      const response = await fetch('/api/shopping-agents');
      const data = await response.json();
      
      if (response.ok) {
        setAgents(data);
      } else {
        setError(data.error || 'Failed to fetch agents');
      }
    } catch (err) {
      setError('An error occurred while fetching agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to create an agent');
        return;
      }

      const filters = {
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
        maxPrice: formData.maxPrice ? Number(formData.maxPrice) : undefined,
        location: formData.location || undefined
      };

      const response = await fetch('/api/shopping-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          filters,
          user_id: session.user.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData({ name: '', description: '', keywords: '', minPrice: '', maxPrice: '', location: '' });
        setShowCreateForm(false);
        fetchAgents();
      } else {
        setError(data.error || 'Failed to create agent');
      }
    } catch (err) {
      setError('An error occurred while creating the agent');
    }
  };

  const runAgent = async (agentId: number) => {
    try {
      const response = await fetch('/api/shopping-agents/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Agent completed! Found ${data.matchesFound} new matches.`);
        fetchAgents();
      } else {
        setError(data.error || 'Failed to run agent');
      }
    } catch (err) {
      setError('An error occurred while running the agent');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-3">
          <p className="uppercase tracking-[0.5em] text-white/60 text-xs">AI Shopping</p>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Shopping Agents
          </h1>
          <p className="text-xl text-slate-300">AI-powered agents that browse marketplaces for you</p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg shadow-indigo-900/40 transition-all duration-300 hover:scale-105"
          >
            + Create New Agent
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-8 shadow-xl shadow-black/40">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Create Shopping Agent
            </h3>
            <form onSubmit={handleCreateAgent} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., My Car Finder"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., Bucharest"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Describe what this agent should look for..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., car, vehicle, automobile"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Min Price</label>
                    <input
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Price</label>
                    <input
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg shadow-indigo-900/40 transition-all duration-300 hover:scale-105"
                >
                  Create Agent
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-8 py-4 rounded-xl bg-slate-800/50 text-white font-semibold border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-300 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Your Agents
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="mt-4 text-slate-400">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Agents Yet</h3>
              <p className="text-slate-400">Create your first shopping agent to start finding deals automatically!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{agent.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          agent.is_active 
                            ? 'bg-green-900/30 text-green-300 border border-green-800/50' 
                            : 'bg-red-900/30 text-red-300 border border-red-800/50'
                        }`}>
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4">{agent.description}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                          <span className="text-slate-400 text-sm">Keywords</span>
                          <p className="text-white font-semibold">
                            {Array.isArray(agent.filters.keywords) ? agent.filters.keywords.join(', ') : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                          <span className="text-slate-400 text-sm">Price Range</span>
                          <p className="text-white font-semibold">
                            {agent.filters.minPrice || 'No min'} - {agent.filters.maxPrice || 'No max'} RON
                          </p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                          <span className="text-slate-400 text-sm">Location</span>
                          <p className="text-white font-semibold">{agent.filters.location || 'Any'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Matches found: <span className="text-white font-semibold">{agent.matches_found}</span></span>
                        <span>•</span>
                        <span>Last checked: {agent.last_checked_at ? new Date(agent.last_checked_at).toLocaleString() : 'Never'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => runAgent(agent.id)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg shadow-indigo-900/40 transition-all duration-300 hover:scale-105"
                      >
                        🚀 Run Agent
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert('Edit functionality coming soon!');
                        }}
                        className="px-6 py-3 rounded-xl bg-slate-800/50 text-white font-semibold border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}