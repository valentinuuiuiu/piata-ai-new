'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

interface RepostWidgetProps {
  adId: number;
  userId: string;
}

interface RepostData {
  can_repost: boolean;
  credits_needed: number;
  user_balance: number;
  days_active: number;
  repost_count: number;
  last_reposted: string | null;
  hours_since_repost: number;
  auto_repost_enabled: boolean;
  auto_repost_interval: string;
}

export default function RepostWidget({ adId, userId }: RepostWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [reposting, setReposting] = useState(false);
  const [data, setData] = useState<RepostData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/repost?ad_id=${adId}`);
      if (!res.ok) throw new Error('Failed to fetch repost data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError('Nu am putut încărca datele de promovare');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser === userId) {
      fetchData();
    }
  }, [currentUser, userId, adId]);

  const handleRepost = async () => {
    if (!data?.can_repost) return;
    
    try {
      setReposting(true);
      const res = await fetch('/api/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: adId })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Repost failed');
      }
      
      // Refresh data
      await fetchData();
      alert('Anunțul a fost promovat cu succes!');
      
    } catch (err: any) {
      alert(err.message || 'A apărut o eroare');
    } finally {
      setReposting(false);
    }
  };

  const toggleAutoRepost = async () => {
    if (!data) return;
    
    try {
      const newState = !data.auto_repost_enabled;
      // Optimistic update
      setData(prev => prev ? ({ ...prev, auto_repost_enabled: newState }) : null);
      
      const res = await fetch('/api/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ad_id: adId,
          enable_auto_repost: newState
        })
      });
      
      if (!res.ok) {
        // Revert on failure
        setData(prev => prev ? ({ ...prev, auto_repost_enabled: !newState }) : null);
        throw new Error('Failed to update auto-repost');
      }
      
    } catch (err) {
      console.error(err);
      alert('Nu am putut actualiza setarea de auto-repost');
    }
  };

  if (!currentUser || currentUser !== userId) return null;
  if (loading) return <div className="animate-pulse h-24 bg-slate-800/50 rounded-2xl"></div>;
  if (error) return null;
  if (!data) return null;

  return (
    <div className="rounded-3xl border border-[#00f0ff]/30 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 shadow-lg shadow-[#00f0ff]/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-[#00f0ff] to-cyan-400 bg-clip-text text-transparent">
          Promovare Anunț
        </h3>
        <div className="text-right">
          <p className="text-xs text-slate-400">Balanță: <span className="text-white font-bold">{data.user_balance} credite</span></p>
          <p className="text-xs text-slate-400">Cost: <span className="text-[#00f0ff] font-bold">{data.credits_needed} credite</span></p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5">
          <div>
            <p className="font-semibold text-white">Repostare Manuală</p>
            <p className="text-xs text-slate-400">Urcă anunțul pe prima poziție</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRepost}
            disabled={!data.can_repost || reposting || data.hours_since_repost < 1}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              !data.can_repost 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#00f0ff] to-blue-600 text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
            }`}
          >
            {reposting ? 'Se procesează...' : 'Repostează Acum'}
          </motion.button>
        </div>

        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/50 border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Auto-Repostare</p>
              <p className="text-xs text-slate-400">0.5 credite / repostare</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={data.auto_repost_enabled}
                onChange={toggleAutoRepost}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]"></div>
            </label>
          </div>

          {data.auto_repost_enabled && (
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-sm text-slate-300">Frecvență:</span>
              <select
                value={data.auto_repost_interval || '24 hours'}
                onChange={async (e) => {
                  const newInterval = e.target.value;
                  try {
                    // Optimistic update
                    setData(prev => prev ? ({ ...prev, auto_repost_interval: newInterval }) : null);
                    
                    const res = await fetch('/api/repost', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        ad_id: adId,
                        enable_auto_repost: true,
                        auto_repost_interval: newInterval
                      })
                    });
                    
                    if (!res.ok) throw new Error('Failed to update interval');
                  } catch (err) {
                    alert('Nu am putut actualiza intervalul');
                    // Revert
                    await fetchData();
                  }
                }}
                className="bg-slate-800 text-white text-sm rounded-lg border border-slate-600 p-1.5 focus:ring-[#00f0ff] focus:border-[#00f0ff]"
              >
                <option value="15 minutes">15 minute</option>
                <option value="30 minutes">30 minute</option>
                <option value="1 hour">1 oră</option>
                <option value="2 hours">2 ore</option>
                <option value="6 hours">6 ore</option>
                <option value="12 hours">12 ore</option>
                <option value="24 hours">24 ore</option>
              </select>
            </div>
          )}
        </div>

        {data.last_reposted && (
          <p className="text-xs text-center text-slate-500">
            Ultima repostare: {new Date(data.last_reposted).toLocaleString('ro-RO')}
          </p>
        )}
      </div>
    </div>
  );
}
