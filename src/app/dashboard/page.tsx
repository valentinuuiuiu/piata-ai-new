'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { PlusCircle, Search, Trash2, Zap, CreditCard, LayoutDashboard } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  price: string | number;
  promoted_until: string | null;
  created_at: string;
  status: string;
  views: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await Promise.all([
          fetchUserListings(user.id),
          fetchUserCredits(user.id)
        ]);
      } else {
        setLoading(false);
      }
    };
    getUserAndData();
  }, []);

  const fetchUserCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('credits_balance')
        .eq('user_id', userId)
        .single();

      if (data) {
        setCredits(data.credits_balance || 0);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
    }
  };

  const fetchUserListings = async (userId: string) => {
    try {
      // Fetch directly from API or Supabase? The API returns a processed list, which is good.
      // But we need to make sure we get *all* listings for the user, not just active ones if the API filters.
      // The current API `GET /api/anunturi` takes a `userId` param but might still filter by status if not careful.
      // Let's use the API for now as it handles image parsing etc.
      const res = await fetch(`/api/anunturi?userId=${userId}&limit=100`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedListing) return;

    const res = await fetch('/api/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anunt_id: selectedListing, duration_hours: duration }),
    });

    if (res.ok) {
      if (user) {
         await Promise.all([
          fetchUserListings(user.id),
          fetchUserCredits(user.id) // Credits are deducted
         ]);
      }
      alert('Promovat cu succes!');
      setSelectedListing(null);
    } else {
      const err = await res.json();
      alert(err.error || 'Eroare');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi acest anunț? Acțiunea este ireversibilă.')) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/anunturi/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Eroare la ștergere');
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Eroare la ștergere');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Acces Restricționat</h2>
        <p className="text-gray-600 mb-6">Te rog să te autentifici pentru a accesa panou de control.</p>
        <Link href="/autentificare" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Autentificare
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <LayoutDashboard className="h-6 w-6 text-blue-600" />
             <h1 className="text-xl font-bold text-gray-900">Panou de Control</h1>
          </div>
          <div className="text-sm text-gray-500">
            Bine ai venit, <span className="font-semibold text-gray-900">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats & Credits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Credits Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Balanță Credite</h3>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{credits} <span className="text-base font-normal text-gray-500">credite</span></div>
              <p className="text-xs text-gray-400 mt-1">Folosește creditele pentru a promova anunțuri.</p>
            </div>
            <div className="mt-6">
               <Link href="/credits" className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition">
                 <CreditCard className="mr-2 h-4 w-4" /> Reîncarcă
               </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Anunțuri Active</h3>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{listings.length}</div>
            </div>
            <div className="mt-6">
              <Link href="/postare" className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                <PlusCircle className="mr-2 h-4 w-4" /> Adaugă Anunț
              </Link>
            </div>
          </div>

           {/* Search Quick Link */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
             <div className="mb-4 p-3 bg-blue-50 rounded-full">
                <Search className="h-6 w-6 text-blue-600" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">Caută Anunțuri</h3>
             <p className="text-sm text-gray-500 mb-4">Vezi ce mai e nou pe piață.</p>
             <Link href="/cautare" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
               Accesează Căutarea &rarr;
             </Link>
           </div>
        </div>

        {/* Listings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h2 className="text-lg font-bold text-gray-800">Anunțurile Mele</h2>
             <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs font-medium">{listings.length} anunțuri</span>
          </div>

          {listings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
               <p className="mb-4">Nu ai niciun anunț postat încă.</p>
               <Link href="/postare" className="text-blue-600 font-semibold hover:underline">Postează primul tău anunț</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listings.map((listing) => (
                <div key={listing.id} className="p-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{listing.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' :
                          listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status === 'active' ? 'Activ' : listing.status === 'pending' ? 'În așteptare' : listing.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4">
                         <span>{listing.price} RON</span>
                         <span>•</span>
                         <span>Adăugat: {new Date(listing.created_at).toLocaleDateString('ro-RO')}</span>
                         <span>•</span>
                         <span>Vizualizări: {listing.views || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Promotion Controls */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg">
                           <select
                            value={selectedListing === listing.id ? duration : 0}
                            onChange={(e) => {
                              setSelectedListing(listing.id);
                              setDuration(Number(e.target.value));
                            }}
                            className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 py-1 pr-8 pl-2"
                           >
                            <option value={0}>Promovează</option>
                            <option value={0.5}>30min (0.5cr)</option>
                            <option value={1}>1h (0.5cr)</option>
                            <option value={2}>2h (0.5cr)</option>
                            <option value={6}>6h (0.5cr)</option>
                            <option value={12}>12h (0.5cr)</option>
                            <option value={24}>24h (0.5cr)</option>
                          </select>
                           {selectedListing === listing.id && duration > 0 && (
                            <button
                              onClick={handlePromote}
                              className="bg-purple-600 hover:bg-purple-700 text-white p-1 rounded transition"
                              title="Aplică promovarea"
                            >
                              <Zap className="h-4 w-4" />
                            </button>
                           )}
                        </div>

                        {listing.promoted_until && new Date(listing.promoted_until) > new Date() && (
                           <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">
                             Promovat până la {new Date(listing.promoted_until).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                        )}

                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={isDeleting === listing.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Șterge anunțul"
                        >
                          {isDeleting === listing.id ? (
                            <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
