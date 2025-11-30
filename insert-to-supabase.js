#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://ndzoavaveppnclkujjhh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const categories = [
  { id: 1, name: 'Imobiliare', slug: 'imobiliare', icon: '🏠' },
  { id: 2, name: 'Auto', slug: 'auto', icon: '🚗' },
  { id: 3, name: 'Electronice', slug: 'electronice', icon: '📱' },
  { id: 4, name: 'Modă', slug: 'moda', icon: '👗' },
  { id: 5, name: 'Servicii', slug: 'servicii', icon: '🔧' },
  { id: 7, name: 'Auto Moto', slug: 'auto-moto', icon: '🚗' },
  { id: 11, name: 'Casă & Grădină', slug: 'casa-gradina', icon: '🏡' },
  { id: 12, name: 'Sport & Hobby', slug: 'sport-hobby', icon: '⚽' },
  { id: 13, name: 'Animale', slug: 'animale', icon: '🐾' },
  { id: 14, name: 'Locuri de Muncă', slug: 'locuri-munca', icon: '💼' },
  { id: 15, name: 'Mama & Copilul', slug: 'mama-copilul', icon: '👶' },
  { id: 16, name: 'Cărți & Muzică', slug: 'carti-muzica', icon: '📚' },
  { id: 17, name: 'Diverse', slug: 'diverse', icon: '📦' }
];

const subcategories = [
  { id: 1, category_id: 1, name: 'Apartamente de vânzare' },
  { id: 2, category_id: 1, name: 'Apartamente de închiriat' },
  { id: 3, category_id: 1, name: 'Case de vânzare' },
  { id: 4, category_id: 1, name: 'Case de închiriat' },
  { id: 5, category_id: 1, name: 'Terenuri' },
  { id: 6, category_id: 1, name: 'Garaje & Spații comerciale' },
  { id: 7, category_id: 2, name: 'Autoturisme' },
  { id: 8, category_id: 2, name: 'Motociclete & Scutere' },
  { id: 9, category_id: 2, name: 'Piese auto' },
  { id: 10, category_id: 2, name: 'Utilitare & Camioane' },
  { id: 11, category_id: 2, name: 'Rulote & Autorulote' },
  { id: 12, category_id: 2, name: 'Bărci & Ambarcațiuni' },
  { id: 13, category_id: 3, name: 'Telefoane mobile' },
  { id: 14, category_id: 3, name: 'Laptop & Desktop' },
  { id: 15, category_id: 3, name: 'Tablete' },
  { id: 16, category_id: 3, name: 'TV & Audio-Video' },
  { id: 17, category_id: 3, name: 'Console & Gaming' },
  { id: 18, category_id: 3, name: 'Camere foto & Video' },
  { id: 19, category_id: 3, name: 'Accesorii electronice' },
  { id: 20, category_id: 4, name: 'Îmbrăcăminte femei' },
  { id: 21, category_id: 4, name: 'Îmbrăcăminte bărbați' },
  { id: 22, category_id: 4, name: 'Încălțăminte' },
  { id: 23, category_id: 4, name: 'Genti & Accesorii' },
  { id: 24, category_id: 4, name: 'Ceasuri & Bijuterii' },
  { id: 25, category_id: 5, name: 'Construcții & Renovări' },
  { id: 26, category_id: 5, name: 'Reparații & Service' },
  { id: 27, category_id: 5, name: 'Curățenie' },
  { id: 28, category_id: 5, name: 'Transport & Mutări' },
  { id: 29, category_id: 5, name: 'Evenimente & Petreceri' },
  { id: 30, category_id: 5, name: 'Foto & Video' },
  { id: 31, category_id: 5, name: 'IT & Web Design' },
  { id: 37, category_id: 7, name: 'Echipamente sport' },
  { id: 38, category_id: 7, name: 'Biciclete' },
  { id: 39, category_id: 7, name: 'Sală & Fitness' },
  { id: 40, category_id: 7, name: 'Camping & Drumeții' },
  { id: 41, category_id: 7, name: 'Instrumente muzicale' },
  { id: 42, category_id: 7, name: 'Colecții & Antichități' },
  { id: 61, category_id: 11, name: 'Cărți' },
  { id: 62, category_id: 11, name: 'Reviste' },
  { id: 63, category_id: 11, name: 'CD & DVD' },
  { id: 64, category_id: 11, name: 'Viniluri' },
  { id: 100, category_id: 11, name: 'Mobilier' },
  { id: 101, category_id: 11, name: 'Electrocasnice' },
  { id: 102, category_id: 11, name: 'Decorațiuni' },
  { id: 103, category_id: 11, name: 'Grădină & Terasă' },
  { id: 104, category_id: 11, name: 'Scule & Unelte' },
  { id: 65, category_id: 12, name: 'Altele' },
  { id: 66, category_id: 12, name: 'Echipamente industrie' },
  { id: 67, category_id: 12, name: 'Schimburi' },
  { id: 68, category_id: 12, name: 'Donații' },
  { id: 105, category_id: 12, name: 'Echipamente sport' },
  { id: 106, category_id: 12, name: 'Biciclete' },
  { id: 107, category_id: 12, name: 'Sală & Fitness' },
  { id: 108, category_id: 12, name: 'Camping & Drumeții' },
  { id: 109, category_id: 12, name: 'Instrumente muzicale' },
  { id: 110, category_id: 12, name: 'Colecții & Antichități' },
  { id: 111, category_id: 13, name: 'Câini' },
  { id: 112, category_id: 13, name: 'Pisici' },
  { id: 113, category_id: 13, name: 'Păsări' },
  { id: 114, category_id: 13, name: 'Acvarii & Pești' },
  { id: 115, category_id: 13, name: 'Alte animale' },
  { id: 116, category_id: 13, name: 'Accesorii animale' },
  { id: 117, category_id: 14, name: 'IT & Software' },
  { id: 118, category_id: 14, name: 'Vânzări & Marketing' },
  { id: 119, category_id: 14, name: 'Construcții' },
  { id: 120, category_id: 14, name: 'Ospitalitate & Turism' },
  { id: 121, category_id: 14, name: 'Educație & Formare' },
  { id: 122, category_id: 14, name: 'Medical & Farmaceutic' },
  { id: 123, category_id: 14, name: 'Alte joburi' },
  { id: 124, category_id: 15, name: 'Îmbrăcăminte copii' },
  { id: 125, category_id: 15, name: 'Jucării' },
  { id: 126, category_id: 15, name: 'Cărucior & Scaune auto' },
  { id: 127, category_id: 15, name: 'Articole bebeluși' },
  { id: 128, category_id: 15, name: 'Mobilier copii' },
  { id: 129, category_id: 16, name: 'Cărți' },
  { id: 130, category_id: 16, name: 'Reviste' },
  { id: 131, category_id: 16, name: 'CD & DVD' },
  { id: 132, category_id: 16, name: 'Viniluri' },
  { id: 133, category_id: 17, name: 'Altele' },
  { id: 134, category_id: 17, name: 'Echipamente industrie' },
  { id: 135, category_id: 17, name: 'Schimburi' },
  { id: 136, category_id: 17, name: 'Donații' }
];

async function insertData() {
  console.log('🚀 Starting data insertion...\n');

  try {
    // Insert categories
    console.log('📋 Inserting categories...');
    for (const cat of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert(cat, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error inserting category ${cat.name}:`, error.message);
      } else {
        console.log(`✅ Category: ${cat.name}`);
      }
    }

    console.log('\n📋 Inserting subcategories...');
    for (const sub of subcategories) {
      const { error } = await supabase
        .from('subcategories')
        .upsert(sub, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error inserting subcategory ${sub.name}:`, error.message);
      } else {
        console.log(`✅ Subcategory: ${sub.name}`);
      }
    }

    console.log('\n✅ All data inserted successfully!');
    console.log(`📊 Summary: ${categories.length} categories, ${subcategories.length} subcategories`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

insertData();
