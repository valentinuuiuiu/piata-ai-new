'use client';

import { useState } from 'react';
import { MessageCircle, Facebook, Smartphone, Copy, Check } from 'lucide-react';

interface SocialShareProps {
  referralCode: string;
}

export default function SocialShare({ referralCode }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  // In a real app, window might not be available during SSR, but this is a client component
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://piata-ai.ro';
  const referralLink = `${baseUrl}/autentificare?ref=${referralCode}`;
  
  const shareText = `Salut! Folosește codul meu ${referralCode} pe Piata AI RO și primești 50 RON credit cadou pentru anunțurile tale! 🚀`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralLink)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  const shareSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareText + ' ' + referralLink)}`;
    window.location.href = url;
  };

  return (
    <div className="space-y-6 p-6 glass rounded-3xl border border-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
      <div className="text-center">
        <h3 className="text-2xl font-black bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-2">
          Invită-ți prietenii
        </h3>
        <p className="text-gray-400 text-sm">
          Ei primesc 50 RON, tu primești 25 RON pentru fiecare prieten care se înscrie!
        </p>
      </div>
      
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-[#00f0ff]/50 transition-all">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Codul tău unic</p>
          <code className="text-2xl font-mono text-white">{referralCode}</code>
        </div>
        <button 
          onClick={handleCopy} 
          className="p-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 rounded-xl transition-all group-hover:scale-110"
          title="Copiază link-ul"
        >
          {copied ? <Check className="text-green-400 w-6 h-6" /> : <Copy className="text-[#00f0ff] w-6 h-6" />}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button 
          onClick={shareWhatsApp} 
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all hover:-translate-y-1"
        >
          <MessageCircle className="w-8 h-8 text-[#25D366]" />
          <span className="text-[10px] font-black uppercase tracking-tighter">WhatsApp</span>
        </button>
        
        <button 
          onClick={shareFacebook} 
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 transition-all hover:-translate-y-1"
        >
          <Facebook className="w-8 h-8 text-[#1877F2]" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Facebook</span>
        </button>

        <button 
          onClick={shareSMS} 
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#ff00f0]/10 hover:bg-[#ff00f0]/20 border border-[#ff00f0]/20 transition-all hover:-translate-y-1"
        >
          <Smartphone className="w-8 h-8 text-[#ff00f0]" />
          <span className="text-[10px] font-black uppercase tracking-tighter">SMS</span>
        </button>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <span>Multi-Tier Rewards Active</span>
          <span className="text-[#00f0ff]">Level 1 & 2</span>
        </div>
      </div>
    </div>
  );
}
