'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setMessage(data.error || 'Eroare la trimitere');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Eroare de conexiune. Te rog încearcă din nou.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link href="/" className="text-[#00f0ff] hover:underline mb-8 inline-block">
        ← Acasă
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 md:p-12 rounded-3xl"
      >
        <h1 className="text-5xl font-black bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-4">
          Contactează-ne
        </h1>
        <p className="text-gray-300 mb-8">
          Ai întrebări, sugestii sau feedback? Trimite-ne un mesaj la{' '}
          <a href="mailto:claude.dev@mail.com" className="text-[#00f0ff] hover:underline">
            claude.dev@mail.com
          </a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#00f0ff] mb-2">
                Nume *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] outline-none transition-colors"
                placeholder="Ion Popescu"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#ff00f0] mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border-2 border-[#ff00f0]/30 focus:border-[#ff00f0] outline-none transition-colors"
                placeholder="ion@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#00ff88] mb-2">
              Subiect *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border-2 border-[#00ff88]/30 focus:border-[#00ff88] outline-none transition-colors"
              placeholder="Întrebare despre..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#ffaa00] mb-2">
              Mesaj *
            </label>
            <textarea
              required
              rows={8}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border-2 border-[#ffaa00]/30 focus:border-[#ffaa00] outline-none transition-colors resize-none"
              placeholder="Scrie mesajul tău aici..."
            />
          </div>

          {status === 'success' && (
            <div className="p-4 rounded-xl bg-green-500/20 border border-green-500 text-green-400">
              ✅ {message}
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500 text-red-400">
              ❌ {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-neon py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? '📤 Se trimite...' : '📧 Trimite Mesaj'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-[#00f0ff]/20">
          <h3 className="text-xl font-bold text-[#00f0ff] mb-4">Alte modalități de contact:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-gray-300">
            <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#00f0ff]/20">
              <div className="text-2xl mb-2">📧</div>
              <p className="font-bold text-[#00f0ff] mb-1">Email</p>
              <a href="mailto:claude.dev@mail.com" className="text-sm hover:underline">
                claude.dev@mail.com
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#25D366]/20">
              <div className="text-2xl mb-2">💬</div>
              <p className="font-bold text-[#25D366] mb-1">WhatsApp</p>
              <a
                href="https://wa.me/40786538708"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                +40 786 538 708
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a2e] border border-[#ff00f0]/20">
              <div className="text-2xl mb-2">💻</div>
              <p className="font-bold text-[#ff00f0] mb-1">GitHub</p>
              <a
                href="https://github.com/piata-ro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                github.com/piata-ro
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
