'use client';

import { useState, useEffect } from 'react';
import { getPAIEyeTracker } from '@/lib/pai-eye-tracker';

export default function PAIEyeScrollToggle() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const tracker = getPAIEyeTracker();

  const toggleEyeScroll = async () => {
    setIsLoading(true);
    
    if (isActive) {
      tracker.stop();
      setIsActive(false);
    } else {
      const success = await tracker.start();
      setIsActive(success);
    }
    
    setIsLoading(false);
  };

  return (
    <button
      onClick={toggleEyeScroll}
      disabled={isLoading}
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 disabled:opacity-50"
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, #00f0ff, #ff00f0)' 
          : 'rgba(30, 30, 30, 0.9)',
        color: 'white',
        border: isActive ? '2px solid rgba(255,255,255,0.3)' : 'none',
      }}
      title={isActive ? "Dezactivează PAI Eye Scroll" : "Activează PAI Eye Scroll"}
    >
      <span className="text-xl">
        {isLoading ? '🔄' : isActive ? '👁️' : '👁️‍🗨️'}
      </span>
      <span className="text-sm font-medium hidden sm:inline">
        {isLoading ? 'Se încarcă...' : isActive ? 'Eye Scroll ON' : 'Eye Scroll'}
      </span>
    </button>
  );
}
