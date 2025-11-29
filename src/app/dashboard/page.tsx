'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Listing {
  id: number;
  title: string;
  price: string | number;
  promoted_until: string | null;
  created_at: string;
  status: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(1);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchUserListings(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const fetchUserListings = async (userId: string) => {
    try {
      const res = await fetch(`/api/anunturi?userId=${userId}`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings');
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
      if (user) fetchUserListings(user.id);
      alert('Promovat cu succes!');
    } else {
      const err = await res.json();
      alert(err.error || 'Eroare');
    }
  };

  if (loading) return <div className="p-8 text-white">Se încarcă...</div>;
  if (!user) return <div className="p-8 text-white">Te rog să te autentifici</div>;

  const credits = 100; // TODO: Get from user profile

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1f] via-[#1a1a2e] to-[#0a0a1f] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent">
          🚀 Dashboard Piata-RO
        </h1>

        {/* Credits */}
        <div className="glass p-8 rounded-2xl mb-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#00f0ff]">Credite</h2>
          <p className="text-6xl font-black text-[#ff00f0]">{credits}</p>
          <p className="text-gray-400 mt-2 text-sm">Post: 5 cr (25 RON) | Promote: 0.5 cr/repost (1 EUR/cr)</p>
          <div className="mt-6 space-x-3">
            <a href="/credits" className="inline-block bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-bold">
              Cumpără Credite
            </a>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6">Anunțurile Mele ({listings.length})</h2>
          {loading ? (
            <p>Se încarcă...</p>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <div>
                    <h3 className="font-bold text-lg">{listing.title}</h3>
                    <p className="text-gray-300">{listing.price} RON</p>
                  </div>
                  <div className="text-right space-y-2">
                    {listing.promoted_until ? (
                      <div className="text-xs bg-yellow-500/20 px-2 py-1 rounded">Promovat până la {new Date(listing.promoted_until).toLocaleString()}</div>
                    ) : (
                      <span className="text-xs text-gray-400">Normal</span>
                    )}
                    <select 
                      value={selectedListing === listing.id ? duration : 0}
                      onChange={(e) => {
                        setSelectedListing(listing.id);
                        setDuration(Number(e.target.value));
                      }}
                      className="bg-black text-white border border-gray-600 px-2 py-1 rounded"
                    >
                      <option value={0}>Selectează durata</option>
                      <option value={0.5}>30min (0.5cr)</option>
                      <option value={1}>1h (0.5cr)</option>
                      <option value={2}>2h (0.5cr)</option>
                      <option value={6}>6h (0.5cr)</option>
                      <option value={12}>12h (0.5cr)</option>
                      <option value={24}>24h (0.5cr)</option>
                    </select>
                  </div>
                </div>
              ))}
              {selectedListing && (
                <button onClick={handlePromote} className="w-full bg-purple-500 hover:bg-purple-600 p-3 rounded-xl font-bold mt-4">
                  Promovează Selectat ({duration}h - 0.5 credite)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/postare" className="p-8 bg-blue-500/20 hover:bg-blue-500 text-white rounded-2xl text-center font-bold text-xl border-2 border-blue-500/50">
            ➕ Postează Anunț Nou
          </Link>
          <Link href="/cautare" className="p-8 bg-green-500/20 hover:bg-green-500 text-white rounded-2xl text-center font-bold text-xl border-2 border-green-500/50">
            🔍 Caută Anunțuri
          </Link>
        </div>
      </div>
    </div>
  );
}