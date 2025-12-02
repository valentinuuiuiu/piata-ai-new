'use client';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

function PostareAnuntContent() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    location: 'București',
    contact_phone: '',
    contact_email: '',
    images: [] as File[]
  });

  const [currentImageInput, setCurrentImageInput] = useState<string>('');
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [creditRequired, setCreditRequired] = useState<{name: string, amount: number, current: number} | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Session check result:', { session: !!session, user: session?.user?.id, error });

      setSession(session);
      setLoadingSession(false);

      if (!session) {
        console.log('No session found, redirecting to login');
        router.push('/autentificare');
        return;
      }
      console.log('User authenticated, proceeding to load data');

      // Load categories
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          setCategories(data.categories || []);
          setLoadingData(false);
        })
        .catch(() => setLoadingData(false));

      // Pre-fill from URL params
      const categoryId = searchParams.get('category_id');
      const subcategoryId = searchParams.get('subcategory_id');
      if (categoryId) {
        setFormData(prev => ({ ...prev, category_id: categoryId }));
      }
      if (subcategoryId) {
        setFormData(prev => ({ ...prev, subcategory_id: subcategoryId }));
      }
    };
    
    checkAuth();
  }, [router, searchParams]);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          const categorySubs = data.subcategories?.filter(
            (sub: Subcategory) => sub.category_id === parseInt(formData.category_id)
          ) || [];
          setSubcategories(categorySubs);
        })
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('Form submission started');
    console.log('Form data:', {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category_id: formData.category_id,
      images: formData.images.length
    });

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Te rog să introduci un titlu');
      return;
    }
    if (!formData.description.trim()) {
      alert('Te rog să introduci o descriere');
      return;
    }
    if (!formData.price.trim()) {
      alert('Te rog să introduci un preț');
      return;
    }
    if (!formData.category_id) {
      alert('Te rog să selectezi o categorie');
      return;
    }

    // Validate image count
    if (formData.images.length < 3) {
      alert('Te rog să selectezi cel puțin 3 imagini');
      return;
    }
    if (formData.images.length > 4) {
      alert('Maximum 4 imagini permise');
      return;
    }

    console.log('Validation passed, preparing to submit');
    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('price', formData.price.trim());
    data.append('category_id', formData.category_id);
    data.append('subcategory_id', formData.subcategory_id || '');
    data.append('location', formData.location.trim());
    data.append('contact_phone', formData.contact_phone.trim());
    data.append('contact_email', formData.contact_email.trim());

    console.log(`Sending ${formData.images.length} images`);
    formData.images.forEach((img, i) => {
      console.log(`Image ${i + 1}: ${img.name} (${Math.round(img.size / 1024)}KB, type: ${img.type})`);
      data.append(`image_${i}`, img);
    });

    try {
      console.log('Refreshing session before API call...');
      const supabase = createClient();
      const { data: { session }, error: refreshError } = await supabase.auth.getSession();
      console.log('Session refresh result:', { session: !!session, user: session?.user?.id, refreshError });

      if (!session) {
        alert('Sesiunea a expirat. Te rog să te autentifici din nou.');
        router.push('/autentificare');
        return;
      }

      console.log('Making API call...');

      // Add user_id to form data
      data.append('user_id', session.user.id);

      console.log('Sending request to /api/anunturi with', formData.images.length, 'images');
      const res = await fetch('/api/anunturi', {
        method: 'POST',
        body: data,
        credentials: 'same-origin'
      });

      console.log('API response status:', res.status);
      console.log('API response headers:', Object.fromEntries(res.headers.entries()));

      const responseText = await res.text();
      console.log('API raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        setError(`Eroare server: ${responseText.substring(0, 100)}`);
        return;
      }

      console.log('API response:', result);

      if (res.ok) {
        alert('Anunț creat cu succes!');
        router.push('/dashboard');
      } else if (res.status === 402 && result.redirectToCredits) {
        // Insufficient credits - show credit warning
        setCreditRequired({
          name: result.categoryName,
          amount: result.requiredCredits,
          current: result.currentCredits
        });
        setShowCreditWarning(true);
        console.log('📢 Insufficient credits detected, showing warning');
      } else {
        setError(`Eroare: ${result.error || 'Eroare necunoscută'}`);
      }
    } catch (error) {
      console.error('Network error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      setError(`Eroare de rețea: ${error instanceof Error ? error.message : 'Te rog să încerci din nou'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSession) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div></div>;
  if (!session) return null;
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 px-4">
      <div className="glass p-12 md:p-16 rounded-3xl text-center shadow-2xl shadow-[#ff00f0]/40">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[#ff00f0] via-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent mb-4 drop-shadow-4xl animate-pulse">
          Postează Anunț Gratuit
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-lg mx-auto leading-relaxed">
          Completează formularul și anunțul tău va fi live în câteva secunde!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-10 md:p-12 rounded-3xl space-y-8 shadow-2xl shadow-[#00f0ff]/30 border border-[#00f0ff]/20">
        <div>
          <label className="block text-lg md:text-xl font-bold mb-4 text-[#00f0ff] animate-pulse">📝 Titlu Anunț</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] focus:ring-4 focus:ring-[#00f0ff]/30 text-white placeholder-gray-400 text-xl font-semibold transition-all duration-300 hover:border-[#00f0ff]/50"
            placeholder="ex: Vând iPhone 15 Pro Max 256GB Nou"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">💰 Preț (RON)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] text-white placeholder-gray-400 text-xl font-bold"
              placeholder="2500"
            />
          </div>
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📍 Locație</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] text-white placeholder-gray-400"
              placeholder="București, Sector 3"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">🏷️ Categorie</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value, subcategory_id: '' }))}
              className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] text-white text-xl font-semibold"
              required
            >
              <option value="">Selectează categorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📂 Subcategorie</label>
            <select
              value={formData.subcategory_id}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory_id: e.target.value }))}
              className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] text-white text-xl font-semibold"
              disabled={!formData.category_id}
            >
              <option value="">Selectează subcategorie (opțional)</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📄 Descriere Detaliată</label>
          <textarea
            rows={8}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] focus:ring-4 focus:ring-[#00f0ff]/30 text-white placeholder-gray-400 resize-vertical text-lg leading-relaxed"
            placeholder="Descrie produsul în detaliu: stare, specificații, motive vânzare, negociere etc..."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📞 Telefon</label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
              className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] text-white"
              placeholder="07xx xxx xxx"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-bold mb-4 text-[#00f0ff]">✉️ Email</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
              className="w-full p-6 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] text-white"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-bold mb-4 text-[#00f0ff]">📸 Imagini (3-4 imagini)</label>

          {/* Selected Images Preview */}
          {formData.images.length > 0 && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-full h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-[#00f0ff]/30">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Imagine ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }));
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
                    title="Șterge imaginea"
                  >
                    ×
                  </button>
                  <div className="text-xs text-center mt-1 text-gray-400">
                    {Math.round(file.size / 1024)}KB
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Single Image Input */}
          {formData.images.length < 4 && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                value={currentImageInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    alert('Fișierul trebuie să fie o imagine');
                    return;
                  }

                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    alert('Imaginea trebuie să fie mai mică de 5MB');
                    return;
                  }

                  // Add to images array
                  setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, file]
                  }));

                  // Reset input
                  setCurrentImageInput('');
                  e.target.value = '';
                }}
                className="w-full p-4 rounded-2xl bg-white/10 border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00f0ff] file:text-black hover:file:bg-[#00f0ff]/80"
              />
              <p className="text-xs text-gray-500 mt-1">
                Adaugă imagini una câte una (maximum 5MB fiecare)
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className={`text-sm font-bold ${formData.images.length >= 3 && formData.images.length <= 4 ? 'text-green-400' : 'text-yellow-400'}`}>
              {formData.images.length}/4 imagini selectate
              {formData.images.length < 3 && ' (minim 3 necesare)'}
              {formData.images.length > 4 && ' (maximum 4 permise)'}
            </p>

            {formData.images.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, images: [] }));
                  setCurrentImageInput('');
                }}
                className="text-sm text-red-400 hover:text-red-300 underline"
              >
                Șterge toate imaginile
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-neon py-8 text-2xl font-black shadow-[0_0_40px_rgba(0,240,255,0.7)] hover:shadow-[0_0_60px_rgba(0,240,255,1)] hover:scale-105 transition-all duration-300 bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '🚀 Se publică...' : '🚀 Publică Anunțul ACUM!'}
        </button>
      {/* Error Display */}
      {error && (
        <div className="glass p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-red-400 font-bold">❌ {error}</p>
        </div>
      )}

      {/* Credit Warning Modal */}
      {showCreditWarning && creditRequired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreditWarning(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-8 rounded-3xl max-w-md w-full text-center border-2 border-red-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">Credite Insuficiente</h2>
            <p className="text-gray-300 mb-6">
              Categoria <span className="font-bold text-[#ff00f0]">"{creditRequired.name}"</span> necesită{' '}
              <span className="font-bold text-[#00ff88]">{creditRequired.amount} credite</span>.
            </p>
            <p className="text-gray-400 mb-6">
              Ai doar <span className="font-bold text-yellow-400">{creditRequired.current} credite</span>.
            </p>
            <div className="space-y-4">
              <Link
                href="/credits"
                className="block w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                🛒 Cumpără Credite
              </Link>
              <button
                onClick={() => setShowCreditWarning(false)}
                className="block w-full py-3 px-6 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
              >
                Anulează
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </form>

      <div className="glass p-8 rounded-2xl text-center border-t-2 border-[#00f0ff]/30">
        <p className="text-lg text-gray-400 mb-4">✅ Anunțul va fi moderat automat de AI în &lt; 30 secunde</p>
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <span>🛡️ Securizat</span>
          <span>⚡ Instant</span>
          <span>💯 Gratuit</span>
        </div>
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <span>🛡️ Securizat</span>
          <span>⚡ Instant</span>
          <span>💯 Gratuit*</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          *Categoriile "Matrimoniale" și "Imobiliare" necesită credite
        </p>
      </div>
    </div>
  );
}

export default function PostareAnunt() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div></div>}>
      <PostareAnuntContent />
    </Suspense>
  );
}