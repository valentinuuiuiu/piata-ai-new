'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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

export default function SubcategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [subcatName, setSubcatName] = useState('');

  useEffect(() => {
    fetch(`/api/anunturi?subcategory_id=${id}`)
      .then(res => res.json())
      .then(data => {
        setListings(Array.isArray(data) ? data : []);
        if (data[0]) setSubcatName(data[0].subcategory_name || 'Anunțuri');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-5xl font-black bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-8">{subcatName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(item => (
          <motion.div key={item.id} className="glass p-6 rounded-2xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all">
            {item.images?.[0] && (
              <Image
                src={item.images[0]}
                alt={item.title}
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
            <p className="text-3xl font-black bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-2">
              {item.price && parseFloat(item.price) > 0 ? `${parseFloat(item.price).toLocaleString()} RON` : 'Gratuit'}
            </p>
            <p className="text-gray-400 text-sm mb-4">{item.location}</p>
            {item.has_boost && (
              <span className={`inline-block px-2 py-1 text-xs rounded-full font-bold mb-2 ${
                item.boost_type === 'featured'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md'
              }`}>
                {item.boost_type === 'featured' ? '🔥 FEATURED' : '⭐ PREMIUM'}
              </span>
            )}
            <Link href={`/anunturi/${item.id}`} className="btn-neon block text-center py-3">Vezi Detalii</Link>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-20 glass p-12 rounded-3xl text-center"
      >
        <h2 className="text-3xl font-bold text-[#00f0ff] mb-4">
          Vrei să vinzi ceva în {subcatName}?
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          Postează un anunț GRATUIT și ajunge la mii de cumpărători!
        </p>
        <Link href={`/postare?subcategory_id=${id}`}>
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
  );
}
