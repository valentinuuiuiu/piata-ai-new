/**
 * Verification Success Page
 * Displays confirmation after email verification
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function VerificationSuccessContent() {
  const searchParams = useSearchParams();
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    const email = searchParams.get('email');
    const platform = searchParams.get('platform');

    setDetails({ type, email, platform });
  }, [searchParams]);

  const getSuccessMessage = () => {
    switch (details?.type) {
      case 'account':
        return {
          title: '🎉 Cont Activat!',
          message: 'Contul tău Piata AI a fost activat cu succes.',
          submessage: 'Acum poți începe să postezi anunțuri inteligente.',
        };
      case 'ad':
        return {
          title: '📢 Anunț Postat!',
          message: `Anunțul tău a fost postat pe ${details.platform}.`,
          submessage: 'AI-ul va monitoriza performanța și îți va trimite insights.',
        };
      case 'permission-approved':
        return {
          title: '✅ Permisiune Acordată!',
          message: 'Cererea de postare a fost aprobată.',
          submessage: 'Anunțul va fi publicat în curând.',
        };
      case 'permission-rejected':
        return {
          title: '❌ Permisiune Respinsă',
          message: 'Cererea de postare a fost respinsă.',
          submessage: 'Contactează administratorul pentru mai multe detalii.',
        };
      default:
        return {
          title: '✅ Verificare Reușită!',
          message: 'Operațiunea a fost finalizată cu succes.',
          submessage: '',
        };
    }
  };

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Se încarcă...</div>
      </div>
    );
  }

  const successInfo = getSuccessMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/30 backdrop-blur-lg rounded-2xl p-8 text-center border border-cyan-500/20">
        <div className="text-6xl mb-6">🚀</div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          {successInfo.title}
        </h1>
        
        <p className="text-xl text-cyan-400 mb-2">
          {successInfo.message}
        </p>
        
        {successInfo.submessage && (
          <p className="text-gray-300 mb-8">
            {successInfo.submessage}
          </p>
        )}

        {details.email && (
          <div className="bg-cyan-500/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400">Email confirmat:</p>
            <p className="text-cyan-400 font-mono">{details.email}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
          >
            Mergi la Piata AI
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-white/10 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Dashboard
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Ai nevoie de ajutor? 
            <a href="/support" className="text-cyan-400 hover:text-cyan-300 ml-1">
              Contactează suportul
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerificationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Se încarcă...</div>
      </div>
    }>
      <VerificationSuccessContent />
    </Suspense>
  );
}