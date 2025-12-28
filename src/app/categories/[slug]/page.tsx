'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AnimatedCard from '@/components/AnimatedCard';
import Link from 'next/link';

const QuantumParticles = dynamic(() => import('@/components/QuantumParticles'), { ssr: false });

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  listing_count?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

// Hardcoded category data matching categories/page.tsx
// Updated to match init-db/route.ts schema
const categoryData: Record<string, Category> = {
  'imobiliare': { id: 1, name: 'Imobiliare', slug: 'imobiliare', icon: '🏠' },
  'auto-moto': { id: 2, name: 'Auto Moto', slug: 'auto-moto', icon: '🚗' },
  'electronice': { id: 3, name: 'Electronice', slug: 'electronice', icon: '📱' },
  'moda': { id: 4, name: 'Modă și Accesorii', slug: 'moda', icon: '👗' },
  'servicii': { id: 5, name: 'Servicii', slug: 'servicii', icon: '🔧' },
  'casa-gradina': { id: 6, name: 'Casă și Grădină', slug: 'casa-gradina', icon: '🏡' },
  'sport-hobby': { id: 7, name: 'Sport & Hobby', slug: 'sport-hobby', icon: '⚽' },
  'animale': { id: 8, name: 'Animale', slug: 'animale', icon: '🐾' },
  'locuri-munca': { id: 9, name: 'Locuri de Muncă', slug: 'locuri-munca', icon: '💼' },
  'mama-copilul': { id: 10, name: 'Mama și Copilul', slug: 'mama-copilul', icon: '👶' },
  'matrimoniale': { id: 11, name: 'Matrimoniale', slug: 'matrimoniale', icon: '💑' },
  'cazare-turism': { id: 12, name: 'Cazare și Turism', slug: 'cazare-turism', icon: '✈️' },
  'diverse': { id: 13, name: 'Diverse', slug: 'diverse', icon: '📦' },
  'carti-muzica': { id: 14, name: 'Cărți & Muzică', slug: 'carti-muzica', icon: '📚' }, // Moved to 14 to avoid conflict
};

// Hardcoded subcategories
const subcategoriesData: Record<string, Subcategory[]> = {
  'imobiliare': [
    { id: 1, name: 'Apartamente', slug: 'apartamente', description: 'Apartamente de vânzare sau închiriere', category_id: 1, listing_count: 450 },
    { id: 2, name: 'Case și Vile', slug: 'case-vile', description: 'Case și vile de vânzare', category_id: 1, listing_count: 320 },
    { id: 3, name: 'Terenuri', slug: 'terenuri', description: 'Terenuri agricole și construcții', category_id: 1, listing_count: 280 },
    { id: 4, name: 'Birouri & Spații Comerciale', slug: 'birouri-spatii', description: 'Spații pentru afaceri', category_id: 1, listing_count: 200 }
  ],
  'auto-moto': [
    { id: 5, name: 'Autoturisme', slug: 'autoturisme', description: 'Mașini noi și second-hand', category_id: 2, listing_count: 560 },
    { id: 6, name: 'Motociclete', slug: 'motociclete', description: 'Moto și scutere', category_id: 2, listing_count: 180 },
    { id: 7, name: 'Piese Auto', slug: 'piese-auto', description: 'Piese, accesorii și consumabile', category_id: 2, listing_count: 150 }
  ],
  'electronice': [
    { id: 8, name: 'Telefoane', slug: 'telefoane', description: 'Smartphone-uri și accesorii', category_id: 3, listing_count: 890 },
    { id: 9, name: 'Laptopuri & PC', slug: 'laptopuri-pc', description: 'Calculatoare și componente', category_id: 3, listing_count: 670 },
    { id: 10, name: 'TV & Audio', slug: 'tv-audio', description: 'Televizoare, boxe, sisteme audio', category_id: 3, listing_count: 450 },
    { id: 11, name: 'Gaming', slug: 'gaming', description: 'Console și accesorii gaming', category_id: 3, listing_count: 330 }
  ],
  'moda': [
    { id: 12, name: 'Haine Damă', slug: 'haine-dama', description: 'Rochii, bluze, pantaloni', category_id: 4, listing_count: 1200 },
    { id: 13, name: 'Haine Bărbați', slug: 'haine-barbati', description: 'Cămăși, pantaloni, costume', category_id: 4, listing_count: 890 },
    { id: 14, name: 'Încălțăminte', slug: 'incaltaminte', description: 'Pantofi și încălțăminte', category_id: 4, listing_count: 760 },
    { id: 15, name: 'Accesorii', slug: 'accesorii', description: 'Genți, bijuterii, ceasuri', category_id: 4, listing_count: 350 }
  ],
  'servicii': [
    { id: 16, name: 'Reparații', slug: 'reparatii', description: 'Reparații auto, electrocasnice', category_id: 5, listing_count: 230 },
    { id: 17, name: 'Consultanță', slug: 'consultanta', description: 'Servicii profesionale', category_id: 5, listing_count: 180 },
    { id: 18, name: 'Evenimente', slug: 'evenimente', description: 'Organizare evenimente', category_id: 5, listing_count: 140 },
    { id: 19, name: 'Curățenie', slug: 'curatenie', description: 'Servicii de curățenie', category_id: 5, listing_count: 120 }
  ],
  'casa-gradina': [
    { id: 20, name: 'Mobilă', slug: 'mobila', description: 'Mobilier pentru casă și grădină', category_id: 6, listing_count: 540 },
    { id: 21, name: 'Electrocasnice', slug: 'electrocasnice', description: 'Aparate electrocasnice', category_id: 6, listing_count: 460 },
    { id: 22, name: 'Grădinărit', slug: 'gradinarit', description: 'Unelte și accesorii grădină', category_id: 6, listing_count: 340 },
    { id: 23, name: 'Decorațiuni', slug: 'decoratiuni', description: 'Obiecte decorative', category_id: 6, listing_count: 200 }
  ],
  'sport-hobby': [
    { id: 24, name: 'Echipamente Sport', slug: 'echipamente-sport', description: 'Echipamente pentru sport', category_id: 7, listing_count: 380 },
    { id: 25, name: 'Biciclete', slug: 'biciclete', description: 'Biciclete și accesorii', category_id: 7, listing_count: 220 },
    { id: 26, name: 'Camping', slug: 'camping', description: 'Echipament pentru camping', category_id: 7, listing_count: 180 }
  ],
  'animale': [
    { id: 27, name: 'Câini', slug: 'caini', description: 'Câini și accesorii', category_id: 8, listing_count: 180 },
    { id: 28, name: 'Pisici', slug: 'pisici', description: 'Pisici și accesorii', category_id: 8, listing_count: 140 },
    { id: 29, name: 'Alte Animale', slug: 'alte-animale', description: 'Păsări, rozătoare, pești', category_id: 8, listing_count: 100 }
  ],
  'locuri-munca': [
    { id: 30, name: 'IT & Software', slug: 'it-software', description: 'Joburi în IT', category_id: 9, listing_count: 670 },
    { id: 31, name: 'Vânzări & Marketing', slug: 'vanzari-marketing', description: 'Joburi în vânzări', category_id: 9, listing_count: 540 },
    { id: 32, name: 'Construcții', slug: 'constructii', description: 'Joburi în construcții', category_id: 9, listing_count: 380 },
    { id: 33, name: 'Horeca', slug: 'horeca', description: 'Joburi în restaurante și hoteluri', category_id: 9, listing_count: 300 }
  ],
  'mama-copilul': [
    { id: 34, name: 'Îmbrăcăminte Copii', slug: 'imbracaminte-copii', description: 'Haine pentru copii', category_id: 10, listing_count: 440 },
    { id: 35, name: 'Jucării', slug: 'jucarii', description: 'Jucării și jocuri', category_id: 10, listing_count: 340 },
    { id: 36, name: 'Cărucioare & Scaune Auto', slug: 'carucioare-scaune', description: 'Transport pentru copii', category_id: 10, listing_count: 200 }
  ],
  'matrimoniale': [
    { id: 40, name: 'Femei caută bărbați', slug: 'femei-cauta-barbati', description: 'Anunțuri matrimoniale femei', category_id: 11, listing_count: 0 },
    { id: 41, name: 'Bărbați caută femei', slug: 'barbati-cauta-femei', description: 'Anunțuri matrimoniale bărbați', category_id: 11, listing_count: 0 },
    { id: 42, name: 'Prietenie', slug: 'prietenie', description: 'Relații de prietenie', category_id: 11, listing_count: 0 }
  ],
  'cazare-turism': [
    { id: 43, name: 'Hoteluri & Pensiuni', slug: 'hoteluri-pensiuni', description: 'Cazare în regim hotelier', category_id: 12, listing_count: 150 },
    { id: 44, name: 'Regim Hotelier', slug: 'regim-hotelier', description: 'Apartamente în regim hotelier', category_id: 12, listing_count: 200 },
    { id: 45, name: 'Case de Vacanță', slug: 'case-vacanta', description: 'Case și cabane de închiriat', category_id: 12, listing_count: 100 }
  ],
  'diverse': [
    { id: 46, name: 'Colecții', slug: 'colectii', description: 'Obiecte de colecție', category_id: 13, listing_count: 450 },
    { id: 47, name: 'Artă & Antichități', slug: 'arta-antichitati', description: 'Obiecte de artă', category_id: 13, listing_count: 380 },
    { id: 48, name: 'Altele', slug: 'altele', description: 'Diverse produse', category_id: 13, listing_count: 370 }
  ],
  'carti-muzica': [
    { id: 37, name: 'Cărți', slug: 'carti', description: 'Cărți și reviste', category_id: 14, listing_count: 320 },
    { id: 38, name: 'Instrumente Muzicale', slug: 'instrumente-muzicale', description: 'Instrumente și accesorii', category_id: 14, listing_count: 240 }
  ]
};

export default function CategorySubcategories() {
  const params = useParams();
  const slug = params.slug as string;
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const category = categoryData[slug];

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    // Try to fetch from API first, fallback to hardcoded data
    fetch('/api/categories?format=rich')
      .then(res => res.json())
      .then(data => {
        const subcats = Array.isArray(data) ? [] : (data.subcategories || []);
        if (subcats.length > 0) {
          const categorySubs = subcats.filter(
            (sub: any) => sub.category_id === category.id
          );
          if (categorySubs.length > 0) {
            setSubcategories(categorySubs);
          } else {
            setSubcategories(subcategoriesData[slug] || []);
          }
        } else {
          setSubcategories(subcategoriesData[slug] || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setSubcategories(subcategoriesData[slug] || []);
        setLoading(false);
      });
  }, [slug, category]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#00f0ff] mb-4">Categorie negăsită</h1>
          <Link href="/categories">
            <button className="btn-neon px-6 py-3 bg-[#ff00f0]">
              ← Înapoi la Categorii
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  return (
    <>
      <QuantumParticles />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Link href="/categories">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-8 px-6 py-3 rounded-xl bg-[#1a1a2e] border-2 border-[#00f0ff]/30 text-[#00f0ff] hover:border-[#00f0ff] transition-all"
          >
            ← Înapoi la Categorii
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="text-8xl mb-6">
            {category.icon}
          </div>
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#00f0ff] via-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            {category.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            {subcategories.length} subcategorii disponibile
          </p>
        </motion.div>

        {subcategories.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center">
            <p className="text-gray-300 text-lg mb-4">
              Nu există subcategorii pentru această categorie încă.
            </p>
            <Link href="/categories">
              <button className="btn-neon px-8 py-4 bg-[#ff00f0]">
                Explorează Alte Categorii
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map((sub, i) => (
              <AnimatedCard key={sub.id} delay={i * 0.05}>
                 <Link href={`/subcategory/${sub.id}`}>
                  <div className="glass p-8 rounded-3xl bg-gradient-to-b from-[#ff00f0]/20 to-[#0080ff]/20 border-2 border-[#ff00f0]/30 hover:shadow-[0_0_40px_rgba(255,0,240,0.4)] transition-all duration-500 cursor-pointer h-full">
                    <h3 className="font-black text-2xl mb-3 text-white">
                      {sub.name}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                      {sub.description}
                    </p>
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#ff00f0]/30 to-[#00f0ff]/30 border border-[#ff00f0]/50 text-[#ff00f0] font-bold text-sm">
                        {sub.listing_count || 0} anunțuri
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 glass p-12 rounded-3xl text-center"
        >
          <h2 className="text-3xl font-bold text-[#00f0ff] mb-4">
            Vrei să vinzi ceva în {category.name}?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Postează un anunț GRATUIT și ajunge la mii de cumpărători!
          </p>
 <Link href={`/postare?category_id=${category.id}`}>
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
