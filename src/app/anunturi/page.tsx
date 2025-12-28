'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  images: string[];
  category_name: string;
  subcategory_name?: string;
  has_boost: boolean;
  boost_type?: string;
}

function AnunturiContent() {
  const [ads, setAds] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);

    fetch(`/api/anunturi?${params.toString()}`)
      .then(res => res.json())
      .then(setAds)
      .finally(() => setLoading(false));
  }, [category, subcategory]);

  if (loading) return <div className="container mx-auto p-8">Încărcare anunțuri...</div>;

  return (
    <div className="container mx-auto p-8">
      <Link href="/" className="text-[#00f0ff] hover:underline mb-8 inline-block">&larr; Acasă</Link>
      <h1 className="text-4xl font-bold mb-8">
        {category ? `Anunțuri din ${category}` : subcategory ? `Anunțuri din ${subcategory}` : 'Toate Anunțurile'}
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ads.map((ad) => (
          <Link key={ad.id} href={`/anunturi/${ad.id}`} className="block">
            <div className="glass p-6 rounded-2xl hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all">
              {ad.images?.[0] && (
                <Image
                  src={ad.images?.[0]?.includes('/optimized/') ? ad.images[0].replace('/optimized/', '/thumbs/thumb-') : ad.images[0]}
                  alt={ad.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <h3 className="font-bold text-xl mb-2">{ad.title}</h3>
              <p className="text-[#00f0ff] font-black text-2xl mb-3">
                {ad.price && parseFloat(ad.price) > 0 ? `${parseFloat(ad.price).toLocaleString()} RON` : 'Gratuit'}
              </p>
              <p className="text-gray-300 line-clamp-2 mb-3 text-sm leading-relaxed">{ad.description || 'Fără descriere'}</p>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{ad.category_name}{ad.subcategory_name ? ` > ${ad.subcategory_name}` : ''}</span>
                {ad.has_boost && (
                  <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                    ad.boost_type === 'featured'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md'
                  }`}>
                    {ad.boost_type === 'featured' ? '🔥 FEATURED' : '⭐ PREMIUM'}
                  </span>
                )}
                <span>📍 {ad.location}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Anunturi() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div></div>}>
      <AnunturiContent />
    </Suspense>
  );
}
