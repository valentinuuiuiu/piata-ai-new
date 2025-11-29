'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const AnuntMapView = dynamic(() => import('@/components/AnuntMapView'), {
  ssr: false,
  loading: () => <div className="h-72 w-full rounded-2xl bg-slate-800 animate-pulse" />
});

import RepostWidget from '@/components/RepostWidget';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80';

interface Listing {
  id: number;
  title: string;
  description?: string;
  price: number | string;
  location?: string;
  phone?: string;
  contact_email?: string;
  images: string | string[] | null;
  lat?: number;
  lng?: number;
  status?: string;
  category?: { name: string };
}

interface Props {
  listing: Listing;
}

export default function AnuntDetails({ listing }: Props) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const imageList = useMemo(() => {
    if (!listing?.images) return [] as string[];
    
    try {
      // If it's already an array, filter valid strings
      if (Array.isArray(listing.images)) {
        return listing.images.filter((img): img is string => typeof img === 'string' && img.length > 0);
      }
      
      // If it's a string, try to parse it
      if (typeof listing.images === 'string') {
        // Check if it looks like a JSON array
        if (listing.images.trim().startsWith('[')) {
          const parsed = JSON.parse(listing.images);
          if (Array.isArray(parsed)) {
            return parsed.filter((img): img is string => typeof img === 'string' && img.length > 0);
          }
        }
        // If not a JSON array, treat as single URL
        return [listing.images];
      }
    } catch (e) {
      console.error('Error parsing images:', e);
      // Fallback: if string, return as single item
      if (typeof listing.images === 'string') {
        return [listing.images];
      }
    }
    
    return [];
  }, [listing?.images]);

  console.log('AnuntDetails - listing.images:', listing.images);
  console.log('AnuntDetails - imageList:', imageList);
  console.log('AnuntDetails - activeImage:', activeImage);

  useEffect(() => {
    if (!imageList.length) {
      setActiveImage(0);
      return;
    }
    setActiveImage(prev => (prev >= imageList.length ? imageList.length - 1 : prev));
  }, [imageList.length]);

  const heroImage = imageList[activeImage] || PLACEHOLDER_IMAGE;
  const previewImages = imageList; // Show all images as thumbnails

  const goPrev = () => {
    if (!imageList.length) return;
    setActiveImage(prev => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!imageList.length) return;
    setActiveImage(prev => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const priceValue = listing.price ? Number(listing.price) : 0;
  const formattedPrice = priceValue > 0 ? `${priceValue.toLocaleString()} RON` : 'Gratuit';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-3">
          <p className="uppercase tracking-[0.5em] text-white/60 text-xs">Anunț premium</p>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            {listing.title}
          </h1>
          <p className="text-4xl font-black text-white/90">{formattedPrice}</p>
          <p className="text-slate-400">📍 {listing.location || 'România'}</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.6em] text-white/60">Galerie</p>
            {imageList.length > 1 && <p className="text-xs text-slate-400">{imageList.length} imagini publicate</p>}
          </div>

          {imageList.length > 0 ? (
            <div className="relative group">
              <motion.div
                key={heroImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                 className="relative h-[520px] md:h-[560px] rounded-[40px] border border-white/10 bg-slate-900/70 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.75)] z-0"
              >
                 <Image
                   src={heroImage}
                   alt={`${listing.title} hero`}
                   fill
                   priority
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
                   className="object-cover"
                   onError={(e) => {
                     console.error(`[Client] Error loading hero image: ${heroImage}`, e);
                   }}
                   onLoad={() => {
                     console.log(`[Client] Successfully loaded hero image: ${heroImage}`);
                   }}
                 />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/80 pointer-events-none" />
              </motion.div>

               <div className="absolute inset-0 flex items-center justify-between px-2 md:px-6 pointer-events-none z-20">
                 <button
                   type="button"
                   onClick={() => {
                     console.log('Prev clicked');
                     goPrev();
                   }}
                   disabled={imageList.length <= 1}
                   className="pointer-events-auto rounded-full w-10 h-10 md:w-16 md:h-16 bg-black/30 md:bg-black/60 backdrop-blur text-white text-2xl md:text-4xl font-black flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-black/80 hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed"
                   aria-label="Imagine anterioară"
                 >
                   ‹
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     console.log('Next clicked');
                     goNext();
                   }}
                   disabled={imageList.length <= 1}
                   className="pointer-events-auto rounded-full w-10 h-10 md:w-16 md:h-16 bg-black/30 md:bg-black/60 backdrop-blur text-white text-2xl md:text-4xl font-black flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-black/80 hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed"
                   aria-label="Următoarea imagine"
                 >
                   ›
                 </button>
               </div>

              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-3"
                initial={{ opacity: 0, translateY: 24 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {previewImages.length > 0 ? (
                  previewImages.map((src, idx) => (
                     <motion.button
                       key={`${src}-${idx}`}
                       type="button"
                       onClick={() => {
                         console.log('Thumbnail clicked:', idx);
                         setActiveImage(idx);
                       }}
                      whileHover={{ scale: 1.05 }}
                      className={`relative w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] ${
                        activeImage === idx ? 'border-[#00f0ff]' : 'border-white/30'
                      }`}
                    >
                      <Image src={src} alt={`${listing.title} thumb ${idx + 1}`} fill sizes="64px" className="object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                    </motion.button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-900/80 px-6 py-2 text-xs tracking-[0.3em] uppercase text-white/60">Imagini se încarcă</div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="rounded-3xl p-16 text-center bg-slate-900/60 border border-slate-800/50">
              <p className="text-lg text-slate-400">📸 Imagini premium în așteptare</p>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 shadow-xl shadow-black/40">
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Descriere</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {listing.description || 'Descriere în lucru. Ajungi primul vizitator și aduci povestea.'}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F172A]/60 to-[#1E293B]/60 p-8 shadow-xl shadow-black/40">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Contact</h2>
              <div className="flex flex-wrap gap-4">
                {listing.phone ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!isLoggedIn) {
                        router.push('/autentificare');
                        return;
                      }
                      setShowPhone(prev => !prev);
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg shadow-indigo-900/40"
                  >
                    {showPhone ? `📞 ${listing.phone}` : '📞 Afișează telefon'}
                  </motion.button>
                ) : (
                  <p className="text-slate-400">Telefon indisponibil</p>
                )}
                {listing.contact_email ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!isLoggedIn) {
                        router.push('/autentificare');
                        return;
                      }
                      setShowEmail(prev => !prev);
                    }}
                    className="px-6 py-3 rounded-2xl bg-slate-800/80 text-white border border-indigo-500/40 shadow-lg shadow-black/40"
                  >
                    {showEmail ? `📧 ${listing.contact_email}` : '📧 Afișează email'}
                  </motion.button>
                ) : (
                  <p className="text-slate-400">Email indisponibil</p>
                )}
                {!listing.phone && !listing.contact_email && <p className="text-slate-400">Contact indisponibil</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Repost Widget - Only visible to owner */}
            <RepostWidget adId={listing.id} userId={(listing as any).user_id} />

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F172A]/70 to-[#1E293B]/70 p-6 shadow-xl shadow-black/40">
              <p className="text-xs uppercase tracking-[0.6em] text-white/50">Locație</p>
              <p className="text-3xl font-black text-[#00f0ff]">{listing.location || 'România'}</p>
              <p className="text-sm text-slate-400 mt-1">Categorie: {listing.category?.name || 'General'}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F172A]/70 to-[#1E293B]/70 p-6 shadow-xl shadow-black/40">
              <AnuntMapView lat={listing.lat} lng={listing.lng} title={listing.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
