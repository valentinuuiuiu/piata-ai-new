'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthCodeError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Get error details from URL params
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const errorCode = searchParams.get('error_code');
    
    if (error || errorDescription || errorCode) {
      setErrorDetails(`${error || ''} ${errorDescription || ''} ${errorCode || ''}`);
    }

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/autentificare');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="glass max-w-2xl w-full p-12 rounded-3xl shadow-2xl shadow-red-500/40">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4">
            Eroare de Autentificare
          </h1>
          <p className="text-xl text-gray-300">
            A apărut o problemă la autentificarea cu Google
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-red-400 mb-3">Detalii eroare:</h2>
          {errorDetails ? (
            <p className="text-gray-300 font-mono text-sm break-words">{errorDetails}</p>
          ) : (
            <p className="text-gray-300">
              Codul de autentificare nu a putut fi schimbat pentru o sesiune validă.
            </p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold text-[#00f0ff] mb-3">Cauze posibile:</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] text-xl">•</span>
              <span>Redirect URI incorect în Google Cloud Console</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] text-xl">•</span>
              <span>Sesiunea a expirat (ai așteptat prea mult)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] text-xl">•</span>
              <span>Cookie-urile sunt blocate în browser</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#00f0ff] text-xl">•</span>
              <span>Configurare incorectă în Supabase Authentication</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold text-[#00f0ff] mb-3">Soluții:</h3>
          <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/50 rounded-xl p-4">
            <p className="text-gray-300 mb-2">
              <strong className="text-[#00f0ff]">1. Verifică Redirect URIs în Google Cloud:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 ml-4 text-sm">
              <li>https://www.piata-ai.ro/auth/callback</li>
              <li>https://piata-ai.ro/auth/callback</li>
              <li>https://ndzoavaveppnclkujjhh.supabase.co/auth/v1/callback</li>
              <li>http://localhost:3000/auth/callback (pentru development)</li>
            </ul>
          </div>

          <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/50 rounded-xl p-4">
            <p className="text-gray-300 mb-2">
              <strong className="text-[#00f0ff]">2. Verifică în Supabase Dashboard:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 ml-4 text-sm">
              <li>Authentication → Providers → Google</li>
              <li>Verifică Client ID și Client Secret</li>
              <li>Site URL: https://www.piata-ai.ro</li>
              <li>Redirect URLs: https://www.piata-ai.ro/auth/callback</li>
            </ul>
          </div>

          <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/50 rounded-xl p-4">
            <p className="text-gray-300">
              <strong className="text-[#00f0ff]">3. Încearcă din nou:</strong> Uneori o nouă încercare rezolvă problema
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-400">
            Redirecționare automată în <span className="text-[#00f0ff] font-bold">{countdown}</span> secunde...
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/autentificare"
              className="btn-neon px-8 py-3 text-lg font-bold shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] transition-all"
            >
              Încearcă Din Nou
            </Link>
            
            <Link 
              href="/"
              className="px-8 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all border border-white/30"
            >
              Înapoi Acasă
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Problema persistă? Contactează-ne la{' '}
            <a 
              href="mailto:support@piata-ai.ro" 
              className="text-[#00f0ff] hover:text-[#ff00f0] transition-colors"
            >
              support@piata-ai.ro
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
