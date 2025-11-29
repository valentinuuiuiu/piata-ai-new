'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image?: string;
}

const mockListings: Listing[] = [
  { id: '1', title: 'Apartament 2 camere București', description: 'Apartament modern în centru', price: 150000, location: 'București', image: '🏠' },
  { id: '2', title: 'Mașină Dacia Logan 2015', description: 'Mașină în stare bună', price: 25000, location: 'Cluj', image: '🚗' },
  { id: '3', title: 'iPhone 12 Pro', description: 'Telefon nou, sigilat', price: 3000, location: 'Timișoara', image: '📱' },
  { id: '4', title: 'Rochie de seară', description: 'Rochie elegantă, mărime M', price: 200, location: 'Iași', image: '👗' },
  { id: '5', title: 'Reparații auto', description: 'Servicii complete de reparații', price: 0, location: 'Constanța', image: '🔧' },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  // For demo, show all listings, in real app filter by category/subcategory
  const listings = mockListings;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/categories">
          <Button variant="outline" className="mb-4">
            ← Înapoi la Categorii
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Anunțuri</h1>
        {category && <p className="text-gray-600">Categorie: {category}, Subcategorie: {subcategory}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="relative overflow-hidden rounded-xl border border-[#1E293B] shadow-lg shadow-black/40 p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] hover:shadow-xl hover:shadow-indigo-900/30 hover:border-indigo-700/50 transition-all duration-300 flex flex-col">
            <div className="h-56 flex items-center justify-center bg-gradient-to-br from-slate-900/40 to-indigo-950/20 rounded-lg mb-4 border border-slate-800/50">
              <span className="text-6xl">{listing.image}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 flex-grow">{listing.title}</h3>
            <p className="text-slate-400 mb-3 text-sm line-clamp-2">{listing.description}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              {listing.price === 0 ? 'Gratuit' : `${listing.price.toLocaleString()} RON`}
            </p>
            <div className="flex justify-between items-center text-sm text-slate-400 mt-auto pt-3 border-t border-slate-800/50">
              <span className="px-3 py-1.5 rounded-md bg-slate-800/50 border border-slate-700/50 text-slate-300 font-medium">
                📍 {listing.location}
              </span>
              <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0">
                Contact
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Listings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00f0ff]"></div></div>}>
      <ListingsContent />
    </Suspense>
  );
}