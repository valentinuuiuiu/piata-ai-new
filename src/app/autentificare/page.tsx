'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useWeb3 } from '@/hooks/use-web3';

export default function Autentificare() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { connectMetaMask, connectSolana, address, error: web3Error } = useWeb3();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0],
          }
        },
      });
      
      if (error) {
        alert(error.message);
      } else {
        alert('Cont creat cu succes! Verifică emailul pentru confirmare.');
        setIsLogin(true);
        setPassword('');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://piata-ai.ro/auth/callback`,
      },
    });
    if (error) alert(error.message);
  };

  const handleFacebookLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) alert(error.message);
  };

  const handleWeb3Login = async (provider: 'metamask' | 'solana') => {
    let walletAddress = null;
    if (provider === 'metamask') {
      walletAddress = await connectMetaMask();
    } else {
      walletAddress = await connectSolana();
    }

    if (walletAddress) {
      // Here you would typically sign a message to verify ownership
      // For now, we just show success
      alert(`Conectat cu portofelul: ${walletAddress}`);
      // You could also create a guest session or map to a user
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="glass max-w-md w-full p-12 rounded-3xl shadow-2xl shadow-[#00f0ff]/40">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-4">
            {isLogin ? 'Autentificare' : 'Înregistrare'}
          </h1>
          <p className="text-xl text-gray-300">Accesează contul tău Piața AI RO</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-xl bg-white text-gray-800 font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuă cu Google
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full py-3 rounded-xl bg-[#1877F2] text-white font-bold hover:bg-[#166fe5] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continuă cu Facebook
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleWeb3Login('metamask')}
              className="py-3 rounded-xl bg-[#F6851B]/10 border border-[#F6851B] text-[#F6851B] font-bold hover:bg-[#F6851B] hover:text-white transition-all"
            >
              🦊 MetaMask
            </button>
            <button
              onClick={() => handleWeb3Login('solana')}
              className="py-3 rounded-xl bg-[#9945FF]/10 border border-[#9945FF] text-[#9945FF] font-bold hover:bg-[#9945FF] hover:text-white transition-all"
            >
              🟣 Phantom
            </button>
          </div>
          {web3Error && <p className="text-red-400 text-sm text-center">{web3Error}</p>}
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-black text-gray-400">sau cu email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-bold mb-3 text-[#00f0ff]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-[#00f0ff]/50 focus:border-[#00f0ff] focus:ring-4 focus:ring-[#00f0ff]/30 text-white placeholder-gray-400 text-lg"
              placeholder="email@exemplu.ro"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-bold mb-3 text-[#00f0ff]">Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-[#00f0ff]/50 focus:border-[#00f0ff] focus:ring-4 focus:ring-[#00f0ff]/30 text-white placeholder-gray-400 text-lg"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon py-5 text-xl font-bold shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] transition-all"
          >
            {loading ? 'Se procesează...' : (isLogin ? 'Intră în Cont' : 'Creează Cont')}
          </button>
        </form>
        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#00f0ff] hover:text-[#ff00f0] font-bold text-lg transition-colors">
            {isLogin ? 'Nu ai cont? Creează unul!' : 'Ai deja cont? Autentifică-te!'}
          </button>
        </div>
      </div>
    </div>
  );
}