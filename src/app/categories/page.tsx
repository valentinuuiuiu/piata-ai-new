'use client';

import { useEffect, useState } from 'react';
import { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

// export const metadata: Metadata = {
//   title: 'Categorii Anunțuri - Piata AI RO',
//   description: 'Explorează toate categoriile de anunțuri din piața românească. Imobiliare, auto, electronice, servicii și multe altele.',
//   keywords: 'categorii anunțuri, imobiliare românia, auto moto, electronice, servicii, piață online categorii',
//   openGraph: {
//     title: 'Categorii Anunțuri - Piata AI RO',
//     description: 'Explorează toate categoriile de anunțuri din piața românească.',
//     url: 'https://piata-ai.ro/categories',
//   },
// };
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AnimatedCard from '@/components/AnimatedCard';
import Link from 'next/link';

const QuantumParticles = dynamic(() => import('@/components/QuantumParticles'), { ssr: false });

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcat_count: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          // Fallback to hardcoded categories if API returns unexpected data
          setCategories([
            {
              id: 1,
              name: 'Imobiliare',
              slug: 'imobiliare',
              icon: '🏠',
              subcat_count: 1250
            },
            {
              id: 2,
              name: 'Auto Moto',
              slug: 'auto-moto',
              icon: '🚗',
              subcat_count: 890
            },
            {
              id: 3,
              name: 'Electronice',
              slug: 'electronice',
              icon: '📱',
              subcat_count: 2340
            },
            {
              id: 4,
              name: 'Modă',
              slug: 'moda',
              icon: '👗',
              subcat_count: 3200
            },
            {
              id: 5,
              name: 'Servicii',
              slug: 'servicii',
              icon: '🔧',
              subcat_count: 670
            },
            {
              id: 6,
              name: 'Casă & Grădină',
              slug: 'casa-gradina',
              icon: '🏡',
              subcat_count: 1540
            },
            {
              id: 7,
              name: 'Sport & Hobby',
              slug: 'sport-hobby',
              icon: '⚽',
              subcat_count: 780
            },
            {
              id: 8,
              name: 'Animale',
              slug: 'animale',
              icon: '🐾',
              subcat_count: 420
            },
            {
              id: 9,
              name: 'Locuri de Muncă',
              slug: 'locuri-munca',
              icon: '💼',
              subcat_count: 1890
            },
            {
              id: 10,
              name: 'Mama & Copilul',
              slug: 'mama-copilul',
              icon: '👶',
              subcat_count: 980
            },
            {
              id: 11,
              name: 'Cărți & Muzică',
              slug: 'carti-muzica',
              icon: '📚',
              subcat_count: 560
            },
            {
              id: 12,
              name: 'Diverse',
              slug: 'diverse',
              icon: '📦',
              subcat_count: 1200
            }
          ]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setError('Nu s-au putut încărca categoriile. Se folosesc categoriile implicite.');
        // Fallback to hardcoded categories on error
        setCategories([
          {
            id: 1,
            name: 'Imobiliare',
            slug: 'imobiliare',
            icon: '🏠',
            subcat_count: 1250
          },
          {
            id: 2,
            name: 'Auto Moto',
            slug: 'auto-moto',
            icon: '🚗',
            subcat_count: 890
          },
          {
            id: 3,
            name: 'Electronice',
            slug: 'electronice',
            icon: '📱',
            subcat_count: 2340
          },
          {
            id: 4,
            name: 'Modă',
            slug: 'moda',
            icon: '👗',
            subcat_count: 3200
          },
          {
            id: 5,
            name: 'Servicii',
            slug: 'servicii',
            icon: '🔧',
            subcat_count: 670
          },
          {
            id: 6,
            name: 'Casă & Grădină',
            slug: 'casa-gradina',
            icon: '🏡',
            subcat_count: 1540
          },
          {
            id: 7,
            name: 'Sport & Hobby',
            slug: 'sport-hobby',
            icon: '⚽',
            subcat_count: 780
          },
          {
            id: 8,
            name: 'Animale',
            slug: 'animale',
            icon: '🐾',
            subcat_count: 420
          },
          {
            id: 9,
            name: 'Locuri de Muncă',
            slug: 'locuri-munca',
            icon: '💼',
            subcat_count: 1890
          },
          {
            id: 10,
            name: 'Mama & Copilul',
            slug: 'mama-copilul',
            icon: '👶',
            subcat_count: 980
          },
          {
            id: 11,
            name: 'Cărți & Muzică',
            slug: 'carti-muzica',
            icon: '📚',
            subcat_count: 560
          },
          {
            id: 12,
            name: 'Diverse',
            slug: 'diverse',
            icon: '📦',
            subcat_count: 1200
          }
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Categorii' }]} />
      <QuantumParticles />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#00f0ff] via-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Categorii Piață AI RO
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Explorează mii de anunțuri organizate inteligent cu AI
          </p>
          {error && (
            <div className="mt-4 text-red-400">
              {error}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <AnimatedCard key={cat.id} delay={i * 0.05}>
              <Link href={`/categories/${cat.slug}`}>
                <div className={`glass p-8 rounded-3xl bg-gradient-to-b from-[#00f0ff]/20 to-[#0080ff]/20 border-2 border-[#00f0ff]/30 hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] transition-all duration-500 cursor-pointer h-full`}>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                    className="text-6xl mb-4 text-center"
                  >
                    {cat.icon}
                  </motion.div>
                  <h3 className="font-black text-2xl mb-3 text-center text-white">
                    {cat.name}
                  </h3>
                  <p className="text-gray-300 text-center mb-4 text-sm leading-relaxed">
                    {cat.subcat_count} subcategorii
                  </p>
                  <div className="text-center">
                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#00f0ff]/30 to-[#ff00f0]/30 border border-[#00f0ff]/50 text-[#00f0ff] font-bold text-sm">
                      {cat.subcat_count} anunțuri
                    </span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 glass p-12 rounded-3xl text-center"
        >
          <h2 className="text-3xl font-bold text-[#00f0ff] mb-4">
            Nu găsești ce cauți?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Postează un anunț GRATUIT și vinde în câteva ore!
          </p>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,0,240,0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="btn-neon px-12 py-5 text-xl bg-[#ff00f0] shadow-[0_0_30px_rgba(255,0,240,0.6)]"
            >
              ✨ Postează Anunț Gratuit
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
