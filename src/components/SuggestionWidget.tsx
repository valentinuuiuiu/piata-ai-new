'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuggestionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Sugestie',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setFormData({ name: '', email: '', type: 'Sugestie', message: '' });
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Eroare la trimitere');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Eroare de conexiune');
    }
  };

  return (
    <>
      {/* Floating Button - Repositioned for mobile */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:bottom-8 md:left-1/2 md:transform md:-translate-x-1/2 z-40 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center justify-center text-2xl md:text-3xl cursor-pointer"
        title="Trimite feedback"
      >
        {isOpen ? '✕' : '💡'}
      </motion.button>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 md:bottom-28 md:left-1/2 md:transform md:-translate-x-1/2 z-40 w-[350px] md:w-[400px] max-w-[calc(100vw-2rem)]"
          >
            <div className="glass p-6 rounded-2xl border-2 border-[#00f0ff]/30 shadow-[0_0_40px_rgba(0,240,255,0.3)]">
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-4">
                💡 Trimite Feedback
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <input
                     type="text"
                     required
                     placeholder="Numele tău"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#00f0ff]/30 focus:border-[#00f0ff] outline-none text-sm min-h-[44px]"
                   />
                 </div>

                 <div>
                   <input
                     type="email"
                     required
                     placeholder="Email"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#ff00f0]/30 focus:border-[#ff00f0] outline-none text-sm min-h-[44px]"
                   />
                 </div>

                 <div>
                   <select
                     value={formData.type}
                     onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#00ff88]/30 focus:border-[#00ff88] outline-none text-sm min-h-[44px]"
                   >
                    <option value="Sugestie">💡 Sugestie</option>
                    <option value="Bug Report">🐛 Raportare Bug</option>
                    <option value="Feature Request">✨ Idee Funcționalitate</option>
                    <option value="Feedback General">💬 Feedback General</option>
                    <option value="Întrebare">❓ Întrebare</option>
                  </select>
                </div>

                 <div>
                   <textarea
                     required
                     rows={4}
                     placeholder="Scrie mesajul tău aici..."
                     value={formData.message}
                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#ffaa00]/30 focus:border-[#ffaa00] outline-none text-sm resize-none"
                   />
                 </div>

                {status === 'success' && (
                  <div className="p-3 rounded-xl bg-green-500/20 border border-green-500 text-green-400 text-sm">
                    ✅ {message}
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-400 text-sm">
                    ❌ {message}
                  </div>
                )}

                 <button
                   type="submit"
                   disabled={status === 'loading'}
                   className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-white font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all disabled:opacity-50 min-h-[44px]"
                 >
                   {status === 'loading' ? '📤 Se trimite...' : '📧 Trimite'}
                 </button>
              </form>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Răspunsuri în{' '}
                <a href="/contact" className="text-[#00f0ff] hover:underline">
                  24-48 ore
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
