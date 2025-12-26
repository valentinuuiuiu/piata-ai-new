'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Fetch credits
        const { data, error } = await supabase
          .from('user_profiles')
          .select('credits_balance')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching credits:', error);
          setCredits(0);
        } else {
          // Cast data to expected type since we don't have full generated types yet
          const profile = data as { credits_balance: number } | null;
          setCredits(profile?.credits_balance || 0);
        }
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <nav className="glass fixed top-0 w-full z-50 shadow-2xl backdrop-blur-2xl border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl md:text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-all">
              Piata AI<span className="hidden sm:inline text-sm ml-1 opacity-60">.ro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/categorii" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Categorii</Link>
            {user ? (
              <>
                <Link href="/postare" className="btn-neon text-sm px-5 py-2">Postează</Link>
                <Link href="/credits" className="glass bg-white/5 px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <span className="text-yellow-400">💰</span>
                  <span className="font-bold">{credits}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Ieșire
                </button>
              </>
            ) : (
              <Link href="/autentificare" className="btn-neon text-sm px-6 py-2.5">
                Autentificare
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-2xl glass bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-white"
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-white"
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-white"
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-[88px] left-4 right-4 z-40 md:hidden glass p-4 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              <Link
                href="/categorii"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors"
              >
                📂 Categorii
              </Link>
              {user ? (
                <>
                  <Link
                    href="/postare"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-neon w-full text-center"
                  >
                    ➕ Postează Anunț
                  </Link>
                  <Link
                    href="/credits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="glass bg-white/5 px-4 py-3 flex items-center justify-between rounded-2xl"
                  >
                    <span>💰 Credite</span>
                    <span className="font-bold text-yellow-400">{credits}</span>
                  </Link>
                  <div className="px-4 py-2 border-t border-white/5 mt-2">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Contul meu</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-400/5 transition-colors"
                  >
                    ❌ Ieșire
                  </button>
                </>
              ) : (
                <Link
                  href="/autentificare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-neon w-full text-center"
                >
                  🔐 Autentificare
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}