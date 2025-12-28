import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // OPTIMIZED: Batch fetch all data with aggregations in parallel
    const [categoriesResult, subcategoriesResult, categoryCountsResult, subcategoryCountsResult] = await Promise.all([
      // Get categories
      supabase
        .from('categories')
        .select('*')
        .order('id'),
      
      // Get subcategories
      supabase
        .from('subcategories')
        .select('*')
        .order('category_id, name'),
      
      // Get listing counts grouped by category_id (single query!)
      supabase
        .from('anunturi')
        .select('category_id')
        .eq('status', 'active'),
      
      // Get listing counts grouped by subcategory_id (single query!)
      supabase
        .from('anunturi')
        .select('subcategory_id')
        .eq('status', 'active')
    ]);

    if (categoriesResult.error) {
      console.error('Categories query error:', categoriesResult.error);
      throw categoriesResult.error;
    }

    if (subcategoriesResult.error) {
      console.error('Subcategories query error:', subcategoriesResult.error);
      throw subcategoriesResult.error;
    }

    const categories = categoriesResult.data || [];
    const subcategories = subcategoriesResult.data || [];
    const listings = categoryCountsResult.data || [];
    const subcategoryListings = subcategoryCountsResult.data || [];

    // Count listings per category (in-memory aggregation - much faster!)
    const categoryListingCounts = listings.reduce((acc: any, listing: any) => {
      acc[listing.category_id] = (acc[listing.category_id] || 0) + 1;
      return acc;
    }, {});

    // Count subcategories per category (in-memory aggregation)
    const categorySubcatCounts = subcategories.reduce((acc: any, subcat: any) => {
      acc[subcat.category_id] = (acc[subcat.category_id] || 0) + 1;
      return acc;
    }, {});

    // Count listings per subcategory (in-memory aggregation)
    const subcategoryListingCounts = subcategoryListings.reduce((acc: any, listing: any) => {
      if (listing.subcategory_id) {
        acc[listing.subcategory_id] = (acc[listing.subcategory_id] || 0) + 1;
      }
      return acc;
    }, {});

    // Attach counts to categories (no additional queries!)
    const categoriesWithCounts = categories.map((cat: any) => ({
      ...cat,
      listing_count: categoryListingCounts[cat.id] || 0,
      subcat_count: categorySubcatCounts[cat.id] || 0
    }));

    // Attach counts to subcategories (no additional queries!)
    const subcategoriesWithCounts = subcategories.map((subcat: any) => ({
      ...subcat,
      listing_count: subcategoryListingCounts[subcat.id] || 0
    }));

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    
    // Check referer to automatically serve the rich format to the postare page
    const referer = req.headers.get('referer') || '';
    const isPostarePage = referer.includes('/postare');

    // Backwards-compatible default: return categories as an array (tests + simple clients)
    // UNLESS we are explicitly asking for rich format OR we are on the postare page which expects rich format
    if ((!format || format === 'array') && !isPostarePage) {
      return NextResponse.json(categoriesWithCounts, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      });
    }

    // Rich response for newer clients
    return NextResponse.json({
      categories: categoriesWithCounts,
      subcategories: subcategoriesWithCounts
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Database error in categories API:', error);
    // Return default categories when database is not accessible
    // Default fallback for array format
    const fallbackCategories = [
        {
          id: 1,
          name: 'Imobiliare',
          slug: 'imobiliare',
          icon: '🏠',
          listing_count: 1250,
          subcat_count: 8
        },
        {
          id: 2,
          name: 'Auto Moto',
          slug: 'auto-moto',
          icon: '🚗',
          listing_count: 890,
          subcat_count: 10
        },
        {
          id: 3,
          name: 'Electronice',
          slug: 'electronice',
          icon: '📱',
          listing_count: 2340,
          subcat_count: 10
        },
        {
          id: 4,
          name: 'Modă și Accesorii',
          slug: 'moda',
          icon: '👗',
          listing_count: 3200,
          subcat_count: 8
        },
        {
          id: 5,
          name: 'Servicii',
          slug: 'servicii',
          icon: '🔧',
          listing_count: 670,
          subcat_count: 9
        },
        {
          id: 6,
          name: 'Casă și Grădină',
          slug: 'casa-gradina',
          icon: '🏡',
          listing_count: 1540,
          subcat_count: 8
        },
        {
          id: 7,
          name: 'Sport & Hobby',
          slug: 'sport-hobby',
          icon: '⚽',
          listing_count: 780,
          subcat_count: 7
        },
        {
          id: 8,
          name: 'Animale',
          slug: 'animale',
          icon: '🐾',
          listing_count: 420,
          subcat_count: 7
        },
        {
          id: 9,
          name: 'Locuri de Muncă',
          slug: 'locuri-munca',
          icon: '💼',
          listing_count: 1890,
          subcat_count: 10
        },
        {
          id: 10,
          name: 'Mama și Copilul',
          slug: 'mama-copilul',
          icon: '👶',
          listing_count: 980,
          subcat_count: 8
        },
        {
          id: 11,
          name: 'Matrimoniale',
          slug: 'matrimoniale',
          icon: '💑',
          listing_count: 120,
          subcat_count: 3
        },
        {
          id: 12,
          name: 'Cazare și Turism',
          slug: 'cazare-turism',
          icon: '✈️',
          listing_count: 350,
          subcat_count: 3
        },
        {
          id: 13,
          name: 'Diverse',
          slug: 'diverse',
          icon: '📦',
          listing_count: 1200,
          subcat_count: 6
        },
        {
          id: 14,
          name: 'Cărți & Muzică',
          slug: 'carti-muzica',
          icon: '📚',
          listing_count: 560,
          subcat_count: 6
        }
      ];

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    // If client asked for rich, include fallback subcategories too.
    if (format && format !== 'array') {
      const fallbackSubcategories = [
        { id: 1, name: 'Apartamente', slug: 'apartamente', category_id: 1 },
        { id: 2, name: 'Case', slug: 'case', category_id: 1 },
        { id: 3, name: 'Terenuri', slug: 'terenuri', category_id: 1 },
        { id: 4, name: 'Mașini', slug: 'masini', category_id: 2 },
        { id: 5, name: 'Motociclete', slug: 'motociclete', category_id: 2 },
        { id: 6, name: 'Piese Auto', slug: 'piese-auto', category_id: 2 },
        { id: 7, name: 'Telefoane', slug: 'telefoane', category_id: 3 },
        { id: 8, name: 'Laptopuri', slug: 'laptopuri', category_id: 3 },
        { id: 9, name: 'TV & Audio', slug: 'tv-audio', category_id: 3 },
        { id: 10, name: 'Îmbrăcăminte', slug: 'imbracaminte', category_id: 4 },
        { id: 11, name: 'Încălțăminte', slug: 'incaltaminte', category_id: 4 },
        { id: 12, name: 'Accesorii', slug: 'accesorii', category_id: 4 },
        { id: 13, name: 'Reparații', slug: 'reparatii', category_id: 5 },
        { id: 14, name: 'Curățenie', slug: 'curatenie', category_id: 5 },
        { id: 15, name: 'Transport', slug: 'transport', category_id: 5 },
        // Matrimoniale subcategories
        { id: 40, name: 'Femei caută bărbați', slug: 'femei-cauta-barbati', category_id: 11 },
        { id: 41, name: 'Bărbați caută femei', slug: 'barbati-cauta-femei', category_id: 11 },
        { id: 42, name: 'Prietenie', slug: 'prietenie', category_id: 11 }
      ];

      return NextResponse.json({
        categories: fallbackCategories,
        subcategories: fallbackSubcategories
      });
    }

    // Preserve default behavior: array
    return NextResponse.json(fallbackCategories);
  }
}
