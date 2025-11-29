'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import AnimatedCard from '@/components/AnimatedCard';
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from '@/lib/structured-data';
import { useStructuredData } from '@/hooks/useStructuredData';

// Removed BlackHole3D and QuantumParticles for performance
// const StarFormation = dynamic(() => import('@/components/BlackHole3D'), { ssr: false });
// const QuantumParticles = dynamic(() => import('@/components/QuantumParticles'), { ssr: false });

interface Listing {
  id: number;
  title: string;
  description?: string;
  price: string;
  category_name: string;
  location: string;
  images: string | string[];
}

export default function Acasa() {
  const [recentListings, setRecentListings] = useState<Listing[]>([]);

  const categories = [
    { icon: '🏠', name: 'Imobiliare', slug: '1', count: 450 },
    { icon: '🚗', name: 'Auto', slug: '2', count: 890 },
    { icon: '📱', name: 'Electronice', slug: '3', count: 1250 },
    { icon: '👕', name: 'Îmbrăcăminte', slug: '4', count: 320 },
    { icon: '🔧', name: 'Servicii', slug: '5', count: 210 },
  ];

  useEffect(() => {
    fetch('/api/anunturi?limit=6')
      .then(res => res.json())
      .then(data => setRecentListings(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch listings:', err));
  }, []);

  // Generate structured data
  const websiteStructuredData = generateWebsiteStructuredData();
  const organizationStructuredData = generateOrganizationStructuredData();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro';

  // Inject structured data safely
  useStructuredData([
    websiteStructuredData,
    organizationStructuredData,
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Anunțuri Recente Piața Automobil",
      "description": "Cele mai noi anunțuri auto din România",
      "numberOfItems": recentListings.length,
      "itemListElement": recentListings.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": item.title,
          "description": item.description,
          "offers": {
            "@type": "Offer",
            "price": parseFloat(item.price || '0'),
            "priceCurrency": "RON",
            "availability": "https://schema.org/InStock"
          },
          "category": item.category_name,
          "location": {
            "@type": "Place",
            "address": item.location
          }
        }
      }))
    }
  ]);

  return (
    <>
      <Head>
        <title>Piața Automobil | Cel mai mare marketplace auto din România</title>
        <meta name="description" content="Descoperă mii de automobile noi și second-hand la cele mai bune prețuri. Vânzători verificați, fotografii reale și informații complete. Cumpără sau vinde mașini în siguranță." />
        <meta name="keywords" content="automobile, masini, vanzari auto, marketplace, second hand, masini second hand, vanzari masini, romania, piata auto" />
        <meta name="author" content="Piața Automobil" />
        <meta name="language" content="Romanian" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="geo.region" content="RO" />
        <meta name="geo.placename" content="România" />
        <meta name="ICBM" content="45.9432,24.9668" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Piața Automobil | Cel mai mare marketplace auto din România" />
        <meta property="og:description" content="Descoperă mii de automobile noi și second-hand la cele mai bune prețuri. Vânzători verificați, fotografii reale și informații complete." />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Piața Automobil" />
        <meta property="og:locale" content="ro_RO" />
        <meta property="og:image" content={`${baseUrl}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Piața Automobil - Marketplace auto România" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Piața Automobil | Cel mai mare marketplace auto din România" />
        <meta name="twitter:description" content="Descoperă mii de automobile noi și second-hand la cele mai bune prețuri." />
        <meta name="twitter:image" content={`${baseUrl}/og-image.jpg`} />
        <meta name="twitter:site" content="@piataautomobil" />
        <meta name="twitter:creator" content="@piataautomobil" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={baseUrl} />
        
        {/* Additional meta tags */}
        <meta name="theme-color" content="#00f0ff" />
        <meta name="msapplication-TileColor" content="#00f0ff" />
        <meta name="application-name" content="Piața Automobil" />
        <meta name="apple-mobile-web-app-title" content="Piața Automobil" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Structured data injected client-side via useStructuredData hook to avoid XSS */}
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="sr-only">
          <ol>
            <li>
              <a href="/">Acasă</a>
            </li>
          </ol>
        </nav>
      </Head>

      {/* Removed 3D animations for performance and stability */}
      <div className="space-y-16 max-w-7xl mx-auto px-4">
        <motion.section
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative overflow-hidden rounded-3xl border border-slate-700/50 shadow-2xl shadow-black/40 p-12 md:p-20 pt-32 md:pt-40 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"
        >
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-8 drop-shadow-lg leading-tight"
          >
            Bine ai venit la<br className="md:hidden" /><span className="block md:inline"> Piața AI RO</span>
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Cea mai rapidă piață online din România. AI-powered marketplace cu design modern.
          </motion.p>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.a
              href="/categories"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 text-xl font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-900/50 transition-all duration-300"
            >
              🔍 Explorează Categorii
            </motion.a>
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 text-xl font-semibold rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-white border border-indigo-500/30 hover:border-indigo-400/50 shadow-lg transition-all duration-300"
            >
              ✨ Panou de Control
            </motion.a>
          </motion.div>
        </motion.section>

        <section className="relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-xl shadow-black/40 p-12 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-12 text-center">Categorii Populare</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {categories.map((cat, i) => (
              <AnimatedCard key={i} delay={i * 0.1}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="block p-8 md:p-10 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/30 transition-all duration-300 text-center group"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-5xl md:text-6xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
                  >
                    {cat.icon}
                  </motion.div>
                  <h3 className="font-black text-lg md:text-2xl lg:text-3xl mb-4 text-white">{cat.name}</h3>
                  <p className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    {cat.count.toLocaleString()} anunțuri
                  </p>
                </Link>
              </AnimatedCard>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <a
              href="/categories"
              className="inline-block px-8 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-indigo-500/30 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-900/40 transition-all duration-300 font-bold text-lg text-white"
            >
              Vezi Toate Categoriile →
            </a>
          </motion.div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-xl shadow-black/40 p-12 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-8 text-center">
            Anunțuri Recente
          </h2>
          <p className="text-center text-gray-300 mb-12 text-xl">
            Descoperă cele mai noi oferte din România
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentListings.length > 0 ? (
              recentListings.map((item, i) => {
                const images = typeof item.images === 'string' ? JSON.parse(item.images) : (Array.isArray(item.images) ? item.images : []);
                const firstImage = images[0] || null;
                return (
                  <AnimatedCard key={item.id} delay={i * 0.1}>
                    <Link href={`/anunt/${item.id}`} className="block h-full">
                      <div className="relative overflow-hidden rounded-xl border border-[#1E293B] shadow-lg shadow-black/40 p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] hover:shadow-xl hover:shadow-indigo-900/30 hover:border-indigo-700/50 transition-all duration-300 h-full flex flex-col">
                         {firstImage ? (
                           <div className="mb-4 rounded-lg overflow-hidden h-56 w-full bg-gradient-to-br from-slate-900 to-slate-800 relative">
                             <Image
                               src={firstImage}
                               alt={item.title}
                               fill
                               className="object-cover"
                               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                             />
                           </div>
                        ) : (
                          <div className="h-56 flex items-center justify-center bg-gradient-to-br from-slate-900/40 to-indigo-950/20 rounded-lg mb-4 border border-slate-800/50">
                            <span className="text-6xl opacity-30">📦</span>
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3 mt-auto">
                          {parseFloat(item.price || '0').toLocaleString()} RON
                        </p>
                        <div className="flex justify-between items-center text-sm text-slate-400 mt-auto pt-3 border-t border-slate-800/50">
                          <span className="px-3 py-1.5 rounded-md bg-slate-800/50 border border-slate-700/50 text-slate-300 font-medium">
                            {item.category_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-indigo-400">📍</span>
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </AnimatedCard>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-400 py-12">
                📦 Se încarcă anunțurile...
              </div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <a
              href="/anunturi"
              className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff00f0]/20 to-[#00f0ff]/20 border-2 border-[#ff00f0]/50 hover:border-[#ff00f0] hover:shadow-[0_0_30px_rgba(255,0,240,0.5)] transition-all duration-300 font-bold text-lg"
            >
              Vezi Toate Anunțurile →
            </a>
          </motion.div>
        </section>

        <div className="glass p-12 rounded-3xl text-center shadow-2xl shadow-[#ff00f0]/30">
          <h2 className="text-4xl font-bold text-[#ff00f0] mb-8 animate-pulse">🚀 De ce Piața AI RO?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6">
              <div className="text-5xl mb-4 animate-pulse">⚡</div>
              <h3 className="text-2xl font-bold mb-2 text-[#00f0ff]">Indexare Instantă</h3>
              <p className="text-gray-300">Anunțurile tale apar în secunde!</p>
            </div>
            <div className="p-6">
              <div className="text-5xl mb-4 animate-pulse">💰</div>
              <h3 className="text-2xl font-bold mb-2 text-[#00f0ff]">100% Gratuit</h3>
              <p className="text-gray-300">Fără comisioane, fără abonamente.</p>
            </div>
            <div className="p-6">
              <div className="text-5xl mb-4 animate-pulse">🛡️</div>
              <h3 className="text-2xl font-bold mb-2 text-[#00f0ff]">Securizat AI</h3>
              <p className="text-gray-300">Moderare automată cu inteligență artificială.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
