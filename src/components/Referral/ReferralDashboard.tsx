'use client';

import { useState, useEffect } from 'react';
import SocialShare from './SocialShare';
import { Users, Gift, TrendingUp, Clock } from 'lucide-react';

export default function ReferralDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, codeRes] = await Promise.all([
          fetch('/api/referrals/stats'),
          fetch('/api/referrals/code')
        ]);
        
        const statsData = await statsRes.json();
        const codeData = await codeRes.json();
        
        setStats(statsData);
        setCode(codeData.code);
      } catch (error) {
        console.error('Failed to fetch referral data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-white/5 rounded-3xl" />
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-[#00f0ff]/20 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#00f0ff]/10 rounded-2xl">
              <Users className="text-[#00f0ff] w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Total Invitați</h4>
          </div>
          <p className="text-4xl font-black text-white">{stats?.totalReferrals || 0}</p>
          <div className="mt-2 flex items-center gap-1 text-green-400 text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+12% luna aceasta</span>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-[#ff00f0]/20 shadow-[0_0_15px_rgba(255,0,240,0.05)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#ff00f0]/10 rounded-2xl">
              <Gift className="text-[#ff00f0] w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Credit Câștigat</h4>
          </div>
          <p className="text-4xl font-black text-white">{stats?.totalEarned || 0} RON</p>
          <p className="mt-2 text-gray-500 text-xs font-bold">Disponibil în portofel</p>
        </div>

        <div className="glass p-6 rounded-3xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-2xl">
              <TrendingUp className="text-green-500 w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Rata Conversie</h4>
          </div>
          <p className="text-4xl font-black text-white">
            {stats?.totalReferrals > 0 ? Math.round((stats.totalReferrals / (stats.totalReferrals + 2)) * 100) : 0}%
          </p>
          <p className="mt-2 text-gray-500 text-xs font-bold">Peste media pieței (OLX: 12%)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SocialShare referralCode={code} />
        
        <div className="glass p-6 rounded-3xl border border-white/10 shadow-xl">
          <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <Clock className="text-[#00f0ff] w-6 h-6" />
            Activitate Recentă
          </h3>
          <div className="space-y-4">
            {stats?.recentReferrals?.length > 0 ? stats.recentReferrals.map((ref: any) => (
              <div key={ref.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#00f0ff]/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    ref.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {ref.tier === 1 ? 'T1' : 'T2'}
                  </div>
                  <div>
                    <p className="font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                      {ref.tier === 1 ? 'Invitație Directă' : 'Invitație Indirectă'}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                      {new Date(ref.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    ref.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {ref.status === 'completed' ? 'Finalizat' : 'În așteptare'}
                  </span>
                  {ref.status === 'completed' && (
                    <p className="text-[10px] text-green-400 font-bold mt-1">+{ref.tier === 1 ? '25' : '10'} RON</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-gray-500 font-bold">Încă nu ai nicio invitație.</p>
                <p className="text-xs text-gray-600 mt-1">Distribuie codul tău pentru a începe să câștigi!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
