'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Head from 'next/head';
import { generateStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data';
import { useStructuredData } from '@/hooks/useStructuredData';

interface Anunt {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  phone: string;
  images: string[] | string;
  category?: { name: string };
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80';

export default function AnuntPage() {
  const params = useParams();
  const [anunt, setAnunt] = useState<Anunt | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/anunturi/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setAnunt(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const images = useMemo<string[]>(() => {
    if (!anunt?.images) return [];
    if (Array.isArray(anunt.images)) {
      return anunt.images.filter(Boolean);
    }
    if (typeof anunt.images === 'string') {
      try {
        const parsed = JSON.parse(anunt.images);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean);
        }
        if (typeof parsed === 'string' && parsed) {
          return [parsed];
        }
      } catch (error) {
        console.warn('Unable to parse images payload', error);
        if (anunt.images) return [anunt.images];
      }
    }
    return [];
  }, [anunt?.images]);

  useEffect(() => {
    if (!images.length) {
      setActiveImageIndex(0);
      return;
    }
    setActiveImageIndex(prev => (prev >= images.length ? images.length - 1 : prev));
  }, [images.length]);

  const goPrev = () => {
    if (!images.length) return;
    setActiveImageIndex(current => (current === 0 ? images.length - 1 : current - 1));
  };

  const goNext = () => {
    if (!images.length) return;
    setActiveImageIndex(current => (current === images.length - 1 ? 0 : current + 1));
  };

  if (loading) return <div className="container mx-auto p-8">Încărcare...</div>;
  if (!anunt) return <div className="container mx-auto p-8">Anunț negăsit</div>;

  // Generate structured data for SEO
  const structuredData = generateStructuredData({
    ...anunt,
    id: anunt.id.toString(),
    price: anunt.price ? parseFloat(anunt.price) : undefined,
    images: images.map(img => ({ url: img }))
  });

  // Debug: Log images to verify they're being parsed correctly
  console.log('🖼️ Images parsed:', images.length, images);
  console.log('📝 Raw anunt.images:', anunt.images);
  console.log('🔢 Active image index:', activeImageIndex);
  
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Acasă', url: '/' },
    { name: 'Anunțuri', url: '/anunturi' },
    { name: anunt.title, url: `/anunturi/${anunt.id}` }
  ]);

  // Inject structured data safely
  useStructuredData([structuredData, breadcrumbData]);

  const heroImage = images[activeImageIndex] || PLACEHOLDER_IMAGE;
  const previewImages = images.slice(0, Math.min(4, images.length));
  
  // Debug: Check what we're working with
  console.log('🎯 Image debug:', {
    totalImages: images.length,
    activeIndex: activeImageIndex,
    heroImage,
    previewImages: previewImages.length,
    allImages: images
  });
  const priceValue = anunt.price ? parseFloat(anunt.price) : 0;
  const formattedPrice = priceValue > 0 ? `${priceValue.toLocaleString()} RON` : 'Gratuit';

  return (
    <>
      <Head>
        <title>{`${anunt.title} - ${anunt.category?.name || 'Automobile'} | Piața Automobil`}</title>
        <meta name="description" content={anunt.description?.substring(0, 160) || `${anunt.title} - Vezi detalii complete și imagini pe Piața Automobil`} />
        <meta name="keywords" content={`${anunt.title}, ${anunt.category?.name || 'automobile'}, piața auto, vânzări mașini, ${anunt.location}`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`${anunt.title} - ${anunt.category?.name || 'Automobile'} | Piața Automobil`} />
        <meta property="og:description" content={anunt.description?.substring(0, 160) || `${anunt.title} - Vezi detalii complete și imagini pe Piața Automobil`} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/anunturi/${anunt.id}`} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Piața Automobil" />
        <meta property="og:locale" content="ro_RO" />
        {images.length > 0 && (
          <meta property="og:image" content={images[0]} />
        )}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${anunt.title} - ${anunt.category?.name || 'Automobile'} | Piața Automobil`} />
        <meta name="twitter:description" content={anunt.description?.substring(0, 160) || `${anunt.title} - Vezi detalii complete și imagini pe Piața Automobil`} />
        {images.length > 0 && (
          <meta name="twitter:image" content={images[0]} />
        )}
        <meta name="twitter:site" content="@piataautomobil" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/anunturi/${anunt.id}`} />
        
        {/* Structured Data - injected client-side via useStructuredData hook */}
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="Piața Automobil" />
        <meta name="language" content="Romanian" />
        <meta name="geo.region" content="RO" />
        <meta name="geo.placename" content={anunt.location} />
        <meta name="ICBM" content="45.9432,24.9668" /> {/* Romania coordinates */}
        
        {/* Product specific meta tags */}
        <meta name="product:brand" content={anunt.category?.name || 'Automobile'} />
        <meta name="product:condition" content="used" />
        <meta name="product:price:amount" content={anunt.price || '0'} />
        <meta name="product:price:currency" content="RON" />
        <meta name="product:availability" content="in stock" />
        <meta name="product:category" content={anunt.category?.name || 'Automobile'} />
        
        {/* Location specific meta tags */}
        <meta name="location:country" content="RO" />
        <meta name="location:region" content="România" />
        <meta name="location:city" content={anunt.location} />
      </Head>
      
      <div className="container mx-auto px-4 py-14">
      <Link href="/anunturi" className="text-[#00f0ff] hover:underline mb-8 inline-block text-sm font-semibold">
        &larr; Înapoi la anunțuri
      </Link>
      <div className="glass p-8 lg:p-12 rounded-[36px] space-y-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] border border-white/10">
        <div className="space-y-4">
          <p className="uppercase text-xs tracking-[0.5em] text-white/60">Anunț premium</p>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">{anunt.title}</h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="relative group">
              <motion.div
                key={heroImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-[480px] md:h-[520px] rounded-[32px] border border-white/10 bg-slate-900/70 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                <Image
                  src={heroImage}
                  alt={`${anunt.title} hero image`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 pointer-events-none" />
              </motion.div>

              {images.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="pointer-events-auto rounded-full w-14 h-14 bg-black/50 backdrop-blur text-white text-3xl font-black flex items-center justify-center shadow-[0_20px_45px_rgba(0,0,0,0.8)] transition-all duration-300 hover:bg-black/70"
                    aria-label="Imagine anterioară"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="pointer-events-auto rounded-full w-14 h-14 bg-black/50 backdrop-blur text-white text-3xl font-black flex items-center justify-center shadow-[0_20px_45px_rgba(0,0,0,0.8)] transition-all duration-300 hover:bg-black/70"
                    aria-label="Următoarea imagine"
                  >
                    ›
                  </button>
                </div>
              )}

              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-3"
                initial={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {previewImages.length > 0 ? (
                  previewImages.map((src, idx) => (
                    <motion.button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      whileHover={{ scale: 1.1 }}
                      className={`relative w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.5)] ${
                        activeImageIndex === idx ? 'border-[#00f0ff]' : 'border-white/30'
                      }`}
                    >
                      <Image src={src} alt={`${anunt.title} thumb ${idx + 1}`} fill sizes="64px" className="object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                    </motion.button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-900/80 px-6 py-2 text-xs tracking-[0.5em] uppercase text-white/60">
                    Imagini în curs de încărcare
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.6em] uppercase text-white/60">Locație</p>
                <p className="text-3xl font-black text-[#00f0ff]">{anunt.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs tracking-[0.6em] uppercase text-white/60">Categorie</p>
                <p className="text-xl font-semibold text-white">{anunt.category?.name || 'General'}</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-[#00f0ff]/10 to-[#ff00f0]/10">
              <p className="text-xs uppercase tracking-[0.5em] text-white/50 mb-2">Preț estimat</p>
              <p className="text-4xl font-black text-green-400">{formattedPrice}</p>
              <p className="text-sm text-gray-400 mt-2">Preț calculat automat pentru vizitatori. Negociabil cu vânzătorul.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Descriere</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line mt-3">
                {anunt.description || 'Descriere în lucru. Ajungi primul vizitator și aduci povestea.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 shadow-inner shadow-black/40">
              <h3 className="text-lg font-bold text-[#ff00f0] mb-2">Contact</h3>
              <p className="text-lg font-semibold text-white">📞 {anunt.phone || 'Nu este disponibil momentan'}</p>
              <Link
                href={`https://wa.me/+40${anunt.phone?.replace(/\D/g, '') || ''}`}
                className="mt-4 inline-flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-[#ff00f0] via-[#00f0ff] to-[#00f0ff] text-black font-black py-3 shadow-[0_15px_45px_rgba(255,0,240,0.4)] hover:shadow-[0_20px_60px_rgba(0,240,255,0.4)] transition-all"
                target="_blank"
              >
                Trimite mesaj acum
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
