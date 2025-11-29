'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcat_count: number;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

export default function Categorii() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data.categories) ? data.categories : [data.categories].filter(Boolean));
        setSubcategories(Array.isArray(data.subcategories) ? data.subcategories : [data.subcategories].filter(Boolean));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  const getSubcatsForCategory = (catId: number) => subcategories.filter(s => s.category_id === catId);

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-12">
      <section className="glass p-16 md:p-24 rounded-[3rem] shadow-2xl shadow-[#00f0ff]/40 text-center">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#ff00f0] via-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-8 drop-shadow-2xl">
          Toate Categoriile
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Descopera mii de anunturi organizate perfect pe categorii. Gaseste exact ce cauti!
        </p>
      </section>
      
      <section className="glass p-12 rounded-[2.5rem] shadow-2xl shadow-[#00f0ff]/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div key={cat.id} className="group p-8 rounded-3xl bg-gradient-to-br from-[#ff00f0]/10 via-[#00f0ff]/5 to-[#ff00f0]/10 border-2 border-transparent hover:border-[#00f0ff]/70 hover:bg-[#00f0ff]/20 hover:shadow-[0_0_40px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-500">
              <div className="text-5xl md:text-6xl mb-6 group-hover:scale-125 transition-transform duration-300 mx-auto">{cat.icon}</div>
              <h3 className="font-black text-xl md:text-2xl lg:text-3xl mb-4 group-hover:text-[#00f0ff] drop-shadow-lg">{cat.name}</h3>
              <p className="text-[#00f0ff] font-bold text-lg md:text-xl bg-gradient-to-r from-[#ff00f0]/50 to-[#00f0ff]/50 bg-clip-text text-transparent drop-shadow-md mb-6">
                {cat.subcat_count} subcategorii
              </p>
              <div className="space-y-2 mb-6">
                {getSubcatsForCategory(cat.id).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/cautare?categoria=${cat.slug}&sub=${sub.slug}`}
                    className="block px-4 py-2 bg-white/5 rounded-xl text-[#00f0ff] hover:text-[#ff00f0] hover:pl-6 transition-all hover:bg-white/10"
                  >
                    → {sub.name}
                  </Link>
                ))}
              </div>
              <Link href={`/cautare?categoria=${cat.slug}`} className="btn-neon w-full text-center py-4 font-bold">
                Vezi toate anunțurile
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        <div className="glass p-10 md:p-12 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-[#00f0ff]/50 transition-all">
          <div className="text-6xl text-[#00f0ff] mb-6 animate-pulse">📊</div>
          <h3 className="text-4xl md:text-5xl font-black text-white mb-2">{categories.length}</h3>
          <p className="text-gray-400 text-lg">Categorii Active</p>
        </div>
        <div className="glass p-10 md:p-12 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-[#ff00f0]/50 transition-all">
          <div className="text-6xl text-[#ff00f0] mb-6 animate-pulse">🔥</div>
          <h3 className="text-4xl md:text-5xl font-black text-[#ff00f0] mb-2">24.567</h3>
          <p className="text-gray-400 text-lg">Anunțuri Totale</p>
        </div>
        <div className="glass p-10 md:p-12 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-[#00ff00]/50 transition-all">
          <div className="text-6xl text-green-400 mb-6 animate-pulse">⚡</div>
          <h3 className="text-4xl md:text-5xl font-black text-green-400 mb-2">100%</h3>
          <p className="text-gray-400 text-lg">Indexare Instant</p>
        </div>
      </section>
    </div>
  );
}
