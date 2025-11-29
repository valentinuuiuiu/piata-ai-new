'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SacredSpace() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // You can add logic here to check credits if needed
        // For now, we'll disable this component
        setIsVisible(false);
      }
    };
    
    checkSession();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 glass p-4 rounded-2xl border border-[#00ff88]/50 bg-[#001a0a]/80">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-[#00ff88] rounded-full animate-pulse"></div>
        <p className="text-[#00ff88] text-sm font-mono">
          NexusOS active • Background guardians
        </p>
      </div>
    </div>
  );
}