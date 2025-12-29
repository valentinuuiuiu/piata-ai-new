'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Se verifică token-ul...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token invalid sau lipsă.');
      return;
    }

    fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Anunțul tău a fost confirmat cu succes! Acum este vizibil pe site.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Eroare la confirmare.');
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus('error');
        setMessage('A apărut o eroare de conexiune.');
      });
  }, [token]);

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className={`p-8 rounded-2xl glass max-w-md w-full text-center border ${
        status === 'success' ? 'border-green-500' : status === 'error' ? 'border-red-500' : 'border-[#00f0ff]'
      }`}>

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00f0ff] mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-4">Verificare în curs...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-2xl font-bold mb-4 text-green-400">Anunț Confirmat!</h1>
            <p className="mb-8 text-gray-300">{message}</p>
            <Link href="/" className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold hover:scale-105 transition-transform">
              Vezi Anunțurile
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold mb-4 text-red-400">Eroare Confirmare</h1>
            <p className="mb-8 text-gray-300">{message}</p>
            <Link href="/" className="text-[#00f0ff] hover:underline">
              Înapoi la prima pagină
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
