'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">Abonează-te la Newsletter</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplu.ro"
          className="flex-1 p-3 rounded-xl bg-white/10 border border-[#00f0ff]/30 focus:border-[#00f0ff] text-white"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            status === 'success' 
              ? 'bg-green-500 text-white' 
              : 'btn-neon bg-[#00f0ff] text-black hover:bg-[#ff00f0] hover:text-white'
          }`}
        >
          {status === 'loading' ? '...' : status === 'success' ? 'Abonat!' : 'Mă Abonez'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2">A apărut o eroare. Încearcă din nou.</p>
      )}
    </div>
  );
}
