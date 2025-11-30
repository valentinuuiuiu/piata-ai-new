'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Agent {
  id: number;
  name: string;
  description: string;
  filters: any;
  is_active: boolean;
  last_checked_at: string | null;
  matches_found: number;
  created_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    filters: {
      priceMin: '',
      priceMax: '',
      location: '',
    },
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!newAgent.name || !newAgent.description) {
      alert('Nume și descriere sunt obligatorii!');
      return;
    }

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgent.name,
          description: newAgent.description,
          filters: {
            priceMin: newAgent.filters.priceMin ? parseInt(newAgent.filters.priceMin) : undefined,
            priceMax: newAgent.filters.priceMax ? parseInt(newAgent.filters.priceMax) : undefined,
            location: newAgent.filters.location || undefined,
          },
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setAgents([data.agent, ...agents]);
        setShowCreateModal(false);
        setNewAgent({ name: '', description: '', filters: { priceMin: '', priceMax: '', location: '' } });
        alert('✅ Agent creat cu succes!');
      } else {
        alert(data.error || 'Eroare la crearea agentului');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Eroare la crearea agentului');
    }
  };

  const toggleAgent = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      });

      if (res.ok) {
        setAgents(agents.map(a => a.id === id ? { ...a, is_active: !isActive } : a));
      }
    } catch (error) {
      console.error('Error toggling agent:', error);
    }
  };

  const deleteAgent = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi acest agent?')) return;

    try {
      const res = await fetch(`/api/agents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAgents(agents.filter(a => a.id !== id));
        alert('Agent șters!');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-2">
              🤖 Agenții Mei de Cumpărături
            </h1>
            <p className="text-gray-400 text-lg">
              Creează agenți AI care monitorizează anunțuri noi și te alertează când găsesc ce cauți!
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-neon px-6 py-3 font-bold whitespace-nowrap"
            disabled={agents.length >= 5}
          >
            ➕ Agent Nou
          </button>
        </div>

        {/* Agents List */}
        {agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-12 rounded-3xl text-center"
          >
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-2 text-white">Niciun agent creat încă</h3>
            <p className="text-gray-400 mb-6">
              Creează primul tău agent AI pentru a monitoriza anunțuri noi!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-neon px-8 py-4 font-bold text-lg"
            >
              Creează Primul Agent
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass p-6 rounded-2xl border-2 ${
                  agent.is_active ? 'border-[#00f0ff]/50' : 'border-gray-600/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                    <p className="text-gray-400 text-sm">{agent.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleAgent(agent.id, agent.is_active)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        agent.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {agent.is_active ? '✓ Activ' : '○ Inactiv'}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-4">
                  <div className="bg-white/5 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-400">Meciuri găsite</div>
                    <div className="text-lg font-bold text-[#00f0ff]">{agent.matches_found}</div>
                  </div>
                  {agent.last_checked_at && (
                    <div className="bg-white/5 px-3 py-2 rounded-lg">
                      <div className="text-xs text-gray-400">Ultima verificare</div>
                      <div className="text-sm text-white">
                        {new Date(agent.last_checked_at).toLocaleDateString('ro-RO')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filters */}
                {agent.filters && Object.keys(agent.filters).length > 0 && (
                  <div className="mb-4 text-sm text-gray-400">
                    <span className="font-bold text-white">Filtre: </span>
                    {agent.filters.priceMin && `De la ${agent.filters.priceMin} RON`}
                    {agent.filters.priceMax && ` până la ${agent.filters.priceMax} RON`}
                    {agent.filters.location && ` în ${agent.filters.location}`}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex-1 text-center py-2 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-all font-bold"
                  >
                    Vezi Meciuri
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-bold"
                  >
                    Șterge
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 rounded-3xl max-w-2xl w-full"
            >
              <h2 className="text-3xl font-black text-[#00f0ff] mb-6">Creează Agent Nou</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white font-bold mb-2">Nume Agent *</label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="ex: Laptop Gaming Sub 3000 RON"
                    className="w-full p-4 rounded-xl bg-white/10 border border-[#00f0ff]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">Ce cauți? *</label>
                  <textarea
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                    placeholder="Descrie în detaliu ce vrei să găsești. Ex: Caut un laptop de gaming cu minim 16GB RAM, RTX 4060 sau mai bun, pentru jocuri AAA"
                    className="w-full p-4 rounded-xl bg-white/10 border border-[#00f0ff]/30 text-white h-32"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-bold mb-2">Preț Min (RON)</label>
                    <input
                      type="number"
                      value={newAgent.filters.priceMin}
                      onChange={(e) =>
                        setNewAgent({
                          ...newAgent,
                          filters: { ...newAgent.filters, priceMin: e.target.value },
                        })
                      }
                      placeholder="0"
                      className="w-full p-4 rounded-xl bg-white/10 border border-[#00f0ff]/30 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Preț Max (RON)</label>
                    <input
                      type="number"
                      value={newAgent.filters.priceMax}
                      onChange={(e) =>
                        setNewAgent({
                          ...newAgent,
                          filters: { ...newAgent.filters, priceMax: e.target.value },
                        })
                      }
                      placeholder="5000"
                      className="w-full p-4 rounded-xl bg-white/10 border border-[#00f0ff]/30 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Locație</label>
                    <input
                      type="text"
                      value={newAgent.filters.location}
                      onChange={(e) =>
                        setNewAgent({
                          ...newAgent,
                          filters: { ...newAgent.filters, location: e.target.value },
                        })
                      }
                      placeholder="București"
                      className="w-full p-4 rounded-xl bg-white/10 border border-[#00f0ff]/30 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={createAgent}
                  className="flex-1 btn-neon py-4 font-bold text-lg"
                >
                  Creează Agent
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-8 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20"
                >
                  Anulează
                </button>
              </div>

              {agents.length >= 4 && (
                <p className="text-yellow-400 text-sm mt-4 text-center">
                  ⚠️ Ai {agents.length}/5 agenți. Mai poți crea doar {5 - agents.length}!
                </p>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
