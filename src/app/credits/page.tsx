'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Package {
  id: number;
  name: string;
  credits: number;
  price: number;
  stripe_price_id?: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function CreditsPage() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoadingSession(false);

      if (session) {
        fetch('/api/credits')
          .then(res => res.json())
          .then(data => {
            setBalance(data.balance || 0);
            setPackages(data.packages || []);
            setTransactions(data.transactions || []);
            setLoadingData(false);
          })
          .catch(err => {
            console.error('Error loading credits:', err);
             setError('Nu s-a putut încărca informațiile despre credite');
            setLoadingData(false);
          });
      } else {
        setLoadingData(false);
      }
    };
    checkAuth();
  }, []);

  const buyPackage = async (packageId: number) => {
    setBuying(packageId);
    setError('');

    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Payment request failed:', res.status, errorText);
        throw new Error(`HTTP ${res.status}: Nu s-a putut procesa plata`);
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr);
        throw new Error('Răspuns invalid de la server');
      }

      if (data.error) {
        setError(data.error);
        setBuying(null);
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error('URL de plată lipsește');
      }
    } catch (err: any) {
      console.error('Buy package error:', err);
      setError(err.message || 'Eroare la procesarea plății');
      setBuying(null);
    }
  };

  if (loadingSession || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-3xl text-center"
        >
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-4">
            Autentificare Necesară
          </h1>
          <p className="text-gray-300 mb-8">
            Trebuie să fii autentificat pentru a cumpăra credite.
          </p>
          <Link href="/autentificare" className="btn-neon px-8 py-4">
            Autentifică-te
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-black bg-gradient-to-r from-[#00f0ff] via-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-4">
          Credite Piata AI
        </h1>
        <p className="text-xl text-gray-300">
          Puterea de a vinde mai repede și mai eficient
        </p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-3xl mb-12 border-2 border-[#00f0ff]/30 text-center"
      >
        <h2 className="text-2xl font-bold text-[#00f0ff] mb-2">Creditul Disponibil</h2>
        <p className="text-6xl font-black bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent">
          {balance} credite
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/20 border border-red-500 text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Packages */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-[#ff00f0] mb-8 text-center">Alege Pachetul Tău</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, i) => {
            const isPopular = i === 1; // Middle package is most popular
            const isPremium = i === packages.length - 1; // Last package is premium

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative glass p-8 rounded-3xl border-2 transition-all duration-300 ${
                  isPopular
                    ? 'border-[#ff00f0] shadow-[0_0_40px_rgba(255,0,240,0.5)] scale-105'
                    : isPremium
                    ? 'border-[#ffaa00]/50 hover:border-[#ffaa00] hover:shadow-[0_0_30px_rgba(255,170,0,0.4)]'
                    : 'border-[#00f0ff]/20 hover:border-[#00f0ff]/60 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-[#ff00f0] to-[#ff00f0]/80 text-white text-sm font-black shadow-lg">
                    🔥 CEL MAI POPULAR
                  </div>
                )}

                {/* Premium Badge */}
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-[#ffaa00] to-[#ff6b00] text-white text-sm font-black shadow-lg">
                    ⭐ BEST VALUE
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-black text-white mb-4">{pkg.name}</h3>

                  {/* Credits */}
                  <div className="mb-6">
                    <div className="text-6xl font-black bg-gradient-to-br from-[#00f0ff] via-[#ff00f0] to-[#ffaa00] bg-clip-text text-transparent mb-2">
                      {pkg.credits}
                    </div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">credite</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="text-4xl font-black text-[#00ff88] mb-1">
                      {pkg.price} <span className="text-2xl">RON</span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      ~{(pkg.price / pkg.credits).toFixed(2)} RON / credit
                    </p>
                  </div>

                  {/* Buy Button - Modern Stripe Style */}
                  <button
                    onClick={() => buyPackage(pkg.id)}
                    disabled={buying === pkg.id}
                    className={`group relative w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#ff00f0] to-[#ff00f0]/80 text-white shadow-[0_0_20px_rgba(255,0,240,0.6)] hover:shadow-[0_0_30px_rgba(255,0,240,0.8)] hover:scale-105'
                        : isPremium
                        ? 'bg-gradient-to-r from-[#ffaa00] to-[#ff6b00] text-white shadow-[0_0_20px_rgba(255,170,0,0.5)] hover:shadow-[0_0_30px_rgba(255,170,0,0.7)] hover:scale-105'
                        : 'bg-gradient-to-r from-[#00f0ff] to-[#00f0ff]/80 text-black shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] hover:scale-105'
                    }`}
                  >
                    {/* Shimmer Effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {buying === pkg.id ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Redirectare...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">💳</span>
                          <span>Cumpără Acum</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Trust Badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <span>🔒</span>
                    <span>Plată securizată prin Stripe</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 text-sm mb-4">Acceptăm toate cardurile majore</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="text-3xl">💳</span>
            <span className="text-2xl">Visa</span>
            <span className="text-2xl">Mastercard</span>
            <span className="text-2xl">💶</span>
            <span className="text-xs text-gray-500 ml-4">Powered by Stripe</span>
          </div>
        </motion.div>
      </div>

      {/* Transactions */}
      {transactions.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-[#00ff88] mb-8">Istoric Tranzacții</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#00f0ff]/20">
                    <th className="p-4 text-left text-[#00f0ff] font-bold">Data</th>
                    <th className="p-4 text-left text-[#ff00f0] font-bold">Descriere</th>
                    <th className="p-4 text-left text-[#00ff88] font-bold">Credite</th>
                    <th className="p-4 text-left text-[#ffaa00] font-bold">Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-[#00f0ff]/10 hover:bg-[#00f0ff]/5"
                    >
                      <td className="p-4 text-gray-300">
                        {new Date(tx.created_at).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="p-4 text-gray-300">{tx.description}</td>
                      <td className={`p-4 font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tx.type === 'purchase'
                            ? 'bg-green-500/20 text-green-400 border border-green-500'
                            : 'bg-red-500/20 text-red-400 border border-red-500'
                        }`}>
                          {tx.type === 'purchase' ? 'Cumpărare' : tx.type}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 glass p-8 rounded-2xl"
      >
        <h3 className="text-2xl font-bold text-[#00f0ff] mb-4">💡 Ce poți face cu creditele?</h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-[#ff00f0] text-xl">🔥</span>
            <span><strong>Featured Boost:</strong> 50 credite - Anunțul tău apare PRIMUL timp de 7 zile</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#ffaa00] text-xl">⭐</span>
            <span><strong>Premium Boost:</strong> 3 credite pe zi - Evidențiere specială</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#00ff88] text-xl">📊</span>
            <span><strong>Optimizare AI:</strong> 1 credit - AI-ul optimizează titlul și descrierea pentru mai multe vizualizări</span>
          </li>
        </ul>

          <li className="flex items-start gap-3">
            <span className="text-[#00ff88] text-xl">🤖</span>
            <span><strong>CV Creat de AI:</strong> 5 credite (opțional) - PAI îți pune întrebări, apoi AI-ul creează un CV profesionist în format PDF pentru tine</span>
          </li>
      </motion.div>
    </div>
  );
}
