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
        const { data } = await supabase
          .from('user_profiles')
          .select('credits_balance')
          .eq('user_id', user.id)
          .single();
        
        // Cast data to expected type since we don't have full generated types yet
        const profile = data as { credits_balance: number } | null;
        setCredits(profile?.credits_balance || 0);
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
      <nav className="glass fixed top-0 w-full z-50 shadow-2xl shadow-[#00f0ff]/20 backdrop-blur-xl border-b border-[#00f0ff]/30">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-lg md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#ff00f0] via-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent hover:scale-105 transition-all">
              Piata AI<span className="hidden sm:inline text-xs md:text-base ml-1">.ro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/categorii" className="btn-neon text-white hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all text-sm px-4 py-2">Categorii</Link>
            {user ? (
              <>
                <Link href="/postare" className="btn-neon bg-[#00f0ff] text-black hover:bg-[#ff00f0] hover:text-white shadow-[0_0_25px_rgba(255,0,240,0.6)] transition-all text-sm px-4 py-2">Postează</Link>
                <Link href="/credits" className="btn-neon bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 shadow-[0_0_25px_rgba(255,193,7,0.6)] transition-all px-4 py-2 rounded-xl text-sm">💰 {credits}</Link>
                <span className="text-white font-bold text-sm hidden lg:block">Bine, {user.email?.split('@')[0]}</span>
                <button
                  onClick={handleSignOut}
                  className="btn-neon bg-[#ff00f0] text-white hover:bg-[#00f0ff] hover:text-black shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all px-4 py-2 rounded-xl text-sm"
                >
                  Ieșire
                </button>
              </>
            ) : (
              <Link href="/autentificare" className="btn-neon bg-[#ff00f0] hover:bg-[#00f0ff] hover:text-black text-white shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all px-6 py-3 rounded-xl text-sm">
                Autentificare
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff00f0]/20 to-[#00f0ff]/20 border border-[#00f0ff]/30 hover:border-[#00f0ff] transition-all"
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-gradient-to-r from-[#ff00f0] to-[#00f0ff]"
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-gradient-to-r from-[#ff00f0] to-[#00f0ff]"
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-gradient-to-r from-[#ff00f0] to-[#00f0ff]"
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[72px] left-0 right-0 z-40 md:hidden glass border-b border-[#00f0ff]/30 shadow-2xl shadow-[#00f0ff]/20"
          >
            <div className="container mx-auto px-3 py-4 flex flex-col gap-3">
              <Link
                href="/categorii"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-neon text-white hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all text-sm px-4 py-3 text-center rounded-xl"
              >
                📂 Categorii
              </Link>
              {user ? (
                <>
                  <Link
                    href="/postare"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-neon bg-[#00f0ff] text-black hover:bg-[#ff00f0] hover:text-white shadow-[0_0_25px_rgba(255,0,240,0.6)] transition-all text-sm px-4 py-3 text-center rounded-xl"
                  >
                    ➕ Postează Anunț
                  </Link>
                  <Link
                    href="/credits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-neon bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 shadow-[0_0_25px_rgba(255,193,7,0.6)] transition-all px-4 py-3 text-center rounded-xl text-sm"
                  >
                    💰 Credite: {credits}
                  </Link>
                  <div className="text-center text-white text-sm py-2">
                    👤 {user.email?.split('@')[0]}
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="btn-neon bg-[#ff00f0] text-white hover:bg-[#00f0ff] hover:text-black shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all px-4 py-3 rounded-xl text-sm"
                  >
                    ❌ Ieșire
                  </button>
                </>
              ) : (
                <Link
                  href="/autentificare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-neon bg-[#ff00f0] hover:bg-[#00f0ff] hover:text-black text-white shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all px-4 py-3 text-center rounded-xl text-sm"
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