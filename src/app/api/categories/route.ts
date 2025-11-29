import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get categories from Supabase
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('id');

    if (categoriesError) {
      console.error('Categories query error:', categoriesError);
      throw categoriesError;
    }

    // Get subcategories from Supabase
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('*')
      .order('category_id, name');

    if (subcategoriesError) {
      console.error('Subcategories query error:', subcategoriesError);
      throw subcategoriesError;
    }

    // Get counts for categories (subcategory count)
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (cat: any) => {
        const { count } = await supabase
          .from('subcategories')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id);

        return {
          ...cat,
          subcat_count: count || 0
        };
      })
    );

    // Get counts for subcategories (listing count)
    const subcategoriesWithCounts = await Promise.all(
      (subcategories || []).map(async (subcat: any) => {
        const { count } = await supabase
          .from('anunturi')
          .select('*', { count: 'exact', head: true })
          .eq('subcategory_id', subcat.id)
          .eq('status', 'active');

        return {
          ...subcat,
          listing_count: count || 0
        };
      })
    );

    return NextResponse.json({
      categories: categoriesWithCounts,
      subcategories: subcategoriesWithCounts
    });
  } catch (error) {
    console.error('Database error in categories API:', error);
    // Return default categories when database is not accessible
    return NextResponse.json({
      categories: [
        {
          id: 1,
          name: 'Imobiliare',
          slug: 'imobiliare',
          icon: '🏠',
          subcat_count: 1250
        },
        {
          id: 2,
          name: 'Auto Moto',
          slug: 'auto-moto',
          icon: '🚗',
          subcat_count: 890
        },
        {
          id: 3,
          name: 'Electronice',
          slug: 'electronice',
          icon: '📱',
          subcat_count: 2340
        },
        {
          id: 4,
          name: 'Modă',
          slug: 'moda',
          icon: '👗',
          subcat_count: 3200
        },
        {
          id: 5,
          name: 'Servicii',
          slug: 'servicii',
          icon: '🔧',
          subcat_count: 670
        },
        {
          id: 6,
          name: 'Casă & Grădină',
          slug: 'casa-gradina',
          icon: '🏡',
          subcat_count: 1540
        },
        {
          id: 7,
          name: 'Sport & Hobby',
          slug: 'sport-hobby',
          icon: '⚽',
          subcat_count: 780
        },
        {
          id: 8,
          name: 'Animale',
          slug: 'animale',
          icon: '🐾',
          subcat_count: 420
        },
        {
          id: 9,
          name: 'Locuri de Muncă',
          slug: 'locuri-munca',
          icon: '💼',
          subcat_count: 1890
        },
        {
          id: 10,
          name: 'Mama & Copilul',
          slug: 'mama-copilul',
          icon: '👶',
          subcat_count: 980
        },
        {
          id: 11,
          name: 'Cărți & Muzică',
          slug: 'carti-muzica',
          icon: '📚',
          subcat_count: 560
        },
        {
          id: 12,
          name: 'Diverse',
          slug: 'diverse',
          icon: '📦',
          subcat_count: 1200
        }
      ],
      subcategories: []
    });
  }
}