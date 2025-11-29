'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SEO from '@/components/SEO';
import Breadcrumb from '@/components/Breadcrumb';

interface Anunt {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  category_name: string;
  icon: string;
  seller_name: string;
  images?: string | string[];
  views?: number;
  created_at?: string;
  is_boosted?: boolean;
}

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular';
}

export const dynamic = 'force-dynamic';

function CautareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [anunturi, setAnunturi] = useState<Anunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('categoria') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'newest'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams();

      // Add all filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      try {
        const res = await fetch(`/api/anunturi/search?${params.toString()}`);
        const data = await res.json();
        setAnunturi(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Search error:', error);
        setAnunturi([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value);
      }
    });
    router.push(`/cautare?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    });
    router.push('/cautare');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  const searchQuery = filters.query || '';
  const categoryName = filters.category || '';
  const pageTitle = categoryName
    ? `Anunțuri ${categoryName} - Cautare Piata AI RO`
    : searchQuery
    ? `Rezultate căutare "${searchQuery}" - Piata AI RO`
    : 'Căutare Anunțuri - Piata AI RO';

  const pageDescription = categoryName
    ? `Descoperă anunțuri din categoria ${categoryName} în piața românească cu AI. ${anunturi.length} rezultate disponibile.`
    : searchQuery
    ? `Rezultate căutare pentru "${searchQuery}" în Piata AI RO. ${anunturi.length} anunțuri găsite.`
    : 'Caută printre mii de anunțuri din România. Piața online cu AI pentru cumpărare și vânzare.';

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`anunțuri ${categoryName || searchQuery}, piață online românia, cumpărare vânzare`}
        canonical={`/cautare${Object.keys(filters).some(key => filters[key as keyof SearchFilters]) ? '?' + new URLSearchParams(Object.entries(filters).filter(([, value]) => value)).toString() : ''}`}
      />
      <Breadcrumb items={[
        { label: 'Căutare', href: '/cautare' },
        ...(categoryName ? [{ label: categoryName }] : [])
      ]} />
      <div className="max-w-6xl mx-auto space-y-12 px-4 py-12">
      <div className="glass p-12 rounded-3xl text-center shadow-2xl shadow-[#00f0ff]/40">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#ff00f0] via-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-6 drop-shadow-2xl">
          Rezultatele Cautarii {filters.category ? ` - ${filters.category}` : ''}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
          {anunturi.length} anunturi gasite. Filtreaza si sorteaza rezultatele.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {anunturi.map((anunt) => (
          <div key={anunt.id} className="glass p-6 md:p-8 rounded-2xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-105 transition-all duration-300 group border border-[#00f0ff]/20 hover:border-[#00f0ff]/50">
            <div className="w-full h-48 md:h-52 bg-gradient-to-br from-[#00f0ff]/20 to-[#ff00f0]/20 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              {(() => {
                const images = typeof anunt.images === 'string' ? JSON.parse(anunt.images) : (Array.isArray(anunt.images) ? anunt.images : []);
                console.log(`Ad ${anunt.id} has ${images.length} images:`, images);
                const firstImage = images[0];

                // Show image count indicator
                return (
                  <div className="relative w-full h-full">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={anunt.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl animate-pulse">{anunt.icon}</span>
                      </div>
                    )}

                    {/* Image count indicator */}
                    {images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {images.length} 📸
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <h3 className="font-bold text-xl md:text-2xl mb-3 line-clamp-2 group-hover:text-[#00f0ff] transition-colors">{anunt.title}</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent drop-shadow-lg">{parseFloat(anunt.price || '0').toLocaleString()} RON</span>
              <span className="text-sm text-gray-400">{anunt.location} • {anunt.seller_name}</span>
            </div>
            <div className="flex gap-2 mb-4 text-sm text-gray-400">
              <span>⭐ 4.9</span>
              <span>🔥 {anunt.views || 0} vizualizări</span>
            </div>
            <Link href={`/anunt/${anunt.id}`} className="block w-full btn-neon text-sm py-3 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              Vezi Detalii →
            </Link>
          </div>
        ))}
      </div>
      
      {anunturi.length === 0 && (
        <div className="glass p-16 rounded-3xl text-center shadow-2xl">
          <p className="text-2xl text-gray-400 mb-8">Niciun anunț găsit</p>
          <Link href="/categorii" className="btn-neon px-12 py-4 text-xl">
            Explorează Categorii
          </Link>
        </div>
      )}
    </div>
    </>
  );
}

export default function Cautare() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    }>
      <CautareContent />
    </Suspense>
  );
}
