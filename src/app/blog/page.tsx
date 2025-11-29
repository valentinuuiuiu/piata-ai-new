'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  image_url?: string;
  views: number;
  published_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-black bg-gradient-to-r from-[#00f0ff] via-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-4">
          Blog AI & Tech
        </h1>
        <p className="text-xl text-gray-300">
          Ultimele știri despre AI, tehnologie și inovație
        </p>
      </motion.div>

      <div className="flex justify-center gap-4 mb-12">
        {['all', 'AI & Technology', 'Machine Learning', 'News'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2 rounded-full transition-all ${
              filter === cat
                ? 'bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-white'
                : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Toate' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="glass p-6 rounded-2xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all h-full flex flex-col">
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#00f0ff]/20 text-[#00f0ff]">
                    {post.category}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#ff00f0]/20 text-[#ff00f0]">
                    {post.views} vizualizări
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-white line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(post.published_at).toLocaleDateString('ro-RO')}</span>
                  <span className="text-[#00f0ff] hover:underline">Citește →</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Niciun articol găsit.</p>
        </div>
      )}
    </div>
  );
}
