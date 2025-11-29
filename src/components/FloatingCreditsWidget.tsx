'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCreditsWidget() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          // Fetch actual credits from user profile
          // Try with UUID first (Supabase auth), then fallback to integer conversion
          let { data, error } = await supabase
            .from('user_profiles')
            .select('credits_balance')
            .eq('user_id', user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Try with integer user_id if UUID fails
            const userIdInt = parseInt(user.id, 10);
            if (!isNaN(userIdInt)) {
              const result = await supabase
                .from('user_profiles')
                .select('credits_balance')
                .eq('user_id', userIdInt)
                .single();
              data = result.data;
              error = result.error;
            }
          }

          if (!error && data) {
            const profile = data as { credits_balance: number };
            setCredits(profile.credits_balance || 0);
          } else {
            // Fallback to default credits if profile doesn't exist
            setCredits(100);
          }
        } catch (err) {
          console.warn('Could not fetch user credits:', err);
          setCredits(100); // Default credits
        }
      }
    };
    getUser();
  }, []);

  // Only show for logged-in users
  if (!user) return null;

  return (
    <>
      {/* Compact floating button - Bottom left, green - Mobile friendly */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
        className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-[45]"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ width: isExpanded ? 'auto' : '56px' }}
          className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] p-2 md:p-3"
        >
          <Link
            href="/credits"
            className="flex items-center gap-2 md:gap-3 text-white font-bold"
          >
            <span className="text-xl md:text-2xl">💰</span>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-1 md:gap-2 whitespace-nowrap"
                >
                  <span className="text-xs md:text-sm">{credits} credite</span>
                  <span className="bg-white/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">Cumpără</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
}
