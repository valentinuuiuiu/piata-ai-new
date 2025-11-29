'use client';
import { useState } from 'react';

export default function AdminDashboard() {
  const [activeWorkflow, setActiveWorkflow] = useState('relay-chain');
  const [kaiStatus, setKaiStatus] = useState('🟢 Live');

  const workflows = [
    '/relay-chain',
    '/marketplace-relay',
    '/blockchain-relay',
    '/orchestrator-relay',
    'generate-listing',
    'smart-match',
    'pallet-blockchain',
    'scrape-publi24',
    'audit-solidity'
  ];

  const workflowDescriptions: Record<string, string> = {
    '/relay-chain': '🚀 Deploy Orchestrator Chain: npm install → fetch categories → start server',
    '/marketplace-relay': '📊 Analytics & AI Listings: PostHog, Grok analysis, moderation',
    '/blockchain-relay': '⛓️ Sacred Nodes: Substrate + Solidity dual chain deployment',
    '/orchestrator-relay': '🧠 Master Brain: Multi-agent orchestration with fabric patterns',
    'generate-listing': '✨ AI Listing Generator: Grok creates titles, descriptions, tags',
    'smart-match': '🎯 Smart Match: AI-powered product matching București',
    'pallet-blockchain': '🔗 FRAME Pallets: Substrate runtime blockchain ops (HIDDEN)',
    'scrape-publi24': '🕷️ Scraper: Fetch Olx/Publi24 listings',
    'audit-solidity': '🛡️ Smart Contract Audit: Security analysis with KAEL-3025'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center mb-8 p-6 bg-gradient-to-r from-[#ff00f0]/30 to-[#00f0ff]/30 rounded-3xl shadow-2xl border border-[#00f0ff]/50">
          <span className="text-lg bg-[#ff00f0] text-black px-4 py-2 rounded-2xl font-bold shadow-lg">@valentinuuiuiu</span>
          <span className="text-lg bg-[#00f0ff] text-black px-4 py-2 rounded-2xl font-bold shadow-lg">@openhands-agent</span>
          <span className="text-lg bg-gray-800 text-white px-4 py-2 rounded-2xl font-bold shadow-lg">@claude</span>
          <span className="text-lg bg-yellow-500 text-black px-4 py-2 rounded-2xl font-bold shadow-lg">@google-labs-jules[bot]</span>
          <span className="text-lg bg-green-500 text-black px-4 py-2 rounded-2xl font-bold shadow-lg">@sourcery-ai[bot]</span>
        </div>
        <h1 className="text-5xl font-black text-center bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-4 drop-shadow-2xl animate-pulse">
          🛠️ Admin Dashboard - Claude Workflows Studio
        </h1>
        <p className="text-center text-xl text-gray-300 mb-12">KAI Backend (7860 Gradio → Next API) | Internal Slash Cmds | Blockchain Hidden | Django-Admin Vibes</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1a1a2e]/80 p-8 rounded-3xl border border-[#00f0ff]/30 backdrop-blur-xl hover:border-[#00f0ff]/60 transition-all">
            <h2 className="text-2xl font-bold mb-6 text-[#00f0ff]">🔗 Claude Workflows (9 Slash / 8 Chains)</h2>
            <select 
              value={activeWorkflow} 
              onChange={(e) => setActiveWorkflow(e.target.value)}
              className="w-full p-4 bg-[#0a0a0a] border-2 border-[#ff00f0] rounded-2xl text-white mb-6 font-mono text-lg hover:border-[#00f0ff]"
            >
              {workflows.map(w => <option key={w}>{w}</option>)}
            </select>
            <div className="h-64 bg-black/50 rounded-2xl p-6 overflow-auto font-mono text-sm border border-gray-700 hover:bg-black/70 transition-all">
              <div className="mb-4 text-[#00f0ff]">
                {workflowDescriptions[activeWorkflow] || `🔧 ${activeWorkflow}`}
              </div>
              <div className="text-gray-300 space-y-2">
                <div>📋 Architecture: <span className="text-[#ff00f0]">PAI → KAI → KAEL-3025</span></div>
                <div>🔗 Relay Chain: <span className="text-green-400">Prompt Chain = LLM Chain</span></div>
                <div>🤖 Multi-Agent: <span className="text-blue-400">Grok + Qwen + Gemini + Claude</span></div>
                <div>💰 Cost: <span className="text-yellow-400">FREE (Grok-4.1-fast)</span></div>
                <div>⚡ Fallback: <span className="text-green-400">Auto-switch on rate limits</span></div>
                {activeWorkflow.includes('blockchain') && (
                  <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700">
                    <div className="text-red-400">🕶️ Blockchain ops HIDDEN in UI</div>
                    <div className="text-xs text-gray-500 mt-1">Substrate pallets simulated in KAI backend</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a2e]/80 p-8 rounded-3xl border border-[#ff00f0]/30 backdrop-blur-xl hover:border-[#ff00f0]/60 transition-all">
            <h2 className="text-2xl font-bold mb-6 text-[#ff00f0]">📊 KAI Backend Status</h2>
            <div className="space-y-4 text-lg grid grid-cols-2">
              <div>PAI Proxy:</div><div className="text-green-400 font-bold">✅ /api/kai Live</div>
              <div>KAEL Source:</div><div className="text-blue-400 font-bold">🔥 3025 Connected</div>
              <div>Blockchain:</div><div className="text-gray-500 font-bold">🕶️ Hidden Ops</div>
              <div>Workflows:</div><div className="text-green-400 font-bold">📋 9 Slash / 8 Chains</div>
              <div>Free LLMs:</div><div className="text-green-400 font-bold">🆓 Grok, Qwen, Gemini</div>
              <div>Rate Limits:</div><div className="text-yellow-400 font-bold">Haiku Fallback ⚡</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}