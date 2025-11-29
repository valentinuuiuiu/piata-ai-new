'use client';

import { motion } from 'framer-motion';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="glass mt-20 p-8 md:p-12 border-t-2 border-[#00f0ff]/30">
      {/* Philosophy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mb-12 p-8 rounded-2xl bg-gradient-to-r from-[#00f0ff]/10 to-[#ff00f0]/10 border border-[#00f0ff]/30"
      >
        <h3 className="text-2xl font-bold text-[#00f0ff] mb-4 text-center">
          🤝 Filosofia Noastră
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🛡️</div>
            <h4 className="font-bold text-[#ff00f0] mb-2">Respect pentru Oameni</h4>
            <p className="text-sm text-gray-400">
              Datele tale sunt securizate cu cele mai moderne tehnologii cloud.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">💡</div>
            <h4 className="font-bold text-[#00ff88] mb-2">Soluții Reale</h4>
            <p className="text-sm text-gray-400">
              AI care rezolvă problemele tale reale, nu hype. Învățăm de la fiecare utilizator.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">🌍</div>
            <h4 className="font-bold text-[#ffaa00] mb-2">Open Source</h4>
            <p className="text-sm text-gray-400">
              Transparent, comunitar, pentru toată lumea. Împreună construim mai bine.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="text-center mb-12">
        <div className="text-2xl md:text-3xl font-bold text-[#00f0ff] mb-6 animate-pulse drop-shadow-lg">
          ACTIV LIVE Piață RO
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 text-lg mb-8 max-w-3xl mx-auto">
          <div className="p-4 rounded-xl bg-[#00f0ff]/5 border border-[#00f0ff]/20">
            <div className="text-accent font-bold">Utilizatori</div>
            <div className="text-3xl text-[#00f0ff] font-black">2,847</div>
          </div>
          <div className="p-4 rounded-xl bg-[#ff00f0]/5 border border-[#ff00f0]/20">
            <div className="text-accent font-bold">Anunțuri</div>
            <div className="text-3xl text-[#ff00f0] font-black">15,492</div>
          </div>
          <div className="p-4 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/20">
            <div className="text-accent font-bold">Volum</div>
            <div className="text-3xl text-[#00ff88] font-black">124.5K RON</div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-xl mx-auto mb-16 text-center">
        <NewsletterForm />
      </div>

      {/* Links Section - Simplified */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8 text-sm">
        <div>
          <h4 className="font-bold text-[#00f0ff] mb-3">Marketplace</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/anunturi" className="hover:text-[#00f0ff] transition-colors">Anunțuri</a></li>
            <li><a href="/postare" className="hover:text-[#00f0ff] transition-colors">Postează</a></li>
            <li><a href="/categories" className="hover:text-[#00f0ff] transition-colors">Categorii</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#ff00f0] mb-3">Suport</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/contact" className="hover:text-[#ff00f0] transition-colors">Contact</a></li>
            <li><a href="/faq" className="hover:text-[#ff00f0] transition-colors">FAQ</a></li>
            <li><a href="/ghid" className="hover:text-[#ff00f0] transition-colors">Ghid</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#00ff88] mb-3">Legal</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/termeni" className="hover:text-[#00ff88] transition-colors">Termeni</a></li>
            <li><a href="/confidentialitate" className="hover:text-[#00ff88] transition-colors">Confidențialitate</a></li>
            <li><a href="/gdpr" className="hover:text-[#00ff88] transition-colors">GDPR</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#ffaa00] mb-3">Comunitate</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/blog" className="hover:text-[#ffaa00] transition-colors">Blog</a></li>
            <li><a href="https://github.com/piata-ro" className="hover:text-[#ffaa00] transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="/despre" className="hover:text-[#ffaa00] transition-colors">Despre</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center pt-6 border-t border-[#00f0ff]/20">
        <p className="text-gray-400 text-sm">
          &copy; 2024 Piața AI RO. Open Source. Privacy-First. Human-Centered.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Construit cu ❤️ pentru România. Powered by AI orchestration workflows.
        </p>
      </div>
    </footer>
  );
}
