'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  published_at: string;
  source_urls?: string[];
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr: any) => {
    if (!dateStr) return new Date().toLocaleDateString('ro-RO');
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toLocaleDateString('ro-RO') : d.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-[#00f0ff] mb-4">Articol negăsit</h1>
        <Link href="/blog" className="btn-neon px-6 py-3">
          ← Înapoi la Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link href="/blog" className="text-[#00f0ff] hover:underline mb-8 inline-block">
        ← Înapoi la Blog
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 md:p-12 rounded-3xl"
      >
        <div className="flex gap-3 mb-6">
          <span className="px-4 py-1 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] text-sm">
            {post.category}
          </span>
          <span className="px-4 py-1 rounded-full bg-[#ff00f0]/20 text-[#ff00f0] text-sm">
            {post.views} vizualizări
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mb-8 text-gray-400 text-sm">
          <span>✍️ {post.author}</span>
          <span>•</span>
          <span>📅 {formatDate(post.published_at)}</span>
        </div>

        <div className="prose prose-invert prose-lg max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-[#00f0ff] mt-8 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-[#ff00f0] mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-[#00ff88] mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props} />,
              a: ({node, ...props}) => <a className="text-[#00f0ff] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              code: ({node, ...props}) => <code className="bg-[#1a1a2e] px-2 py-1 rounded text-[#00f0ff] text-sm" {...props} />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 mb-3">TAGS:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-[#1a1a2e] text-gray-300 text-sm border border-[#00f0ff]/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.source_urls && post.source_urls.length > 0 && (
          <div className="border-t border-[#00f0ff]/20 pt-6">
            <h3 className="text-sm font-bold text-gray-400 mb-3">SURSE:</h3>
            <ul className="space-y-2">
              {post.source_urls.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00f0ff] hover:underline text-sm break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.article>

      <div className="mt-12 text-center">
        <Link href="/blog" className="btn-neon px-8 py-4">
          ← Vezi toate articolele
        </Link>
      </div>
    </div>
  );
}
