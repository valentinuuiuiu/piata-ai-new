import { NextResponse } from 'next/server'
import { supabase } from '@/integrations/supabase/client'

export async function GET() {
  try {
    // Using mock supabase client for now
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
    
    // Get all active listings
    const { data: advertisements, error } = await supabase
      .from('anunturi')
      .select('id, updated_at, created_at')
      .eq('status', 'active')
      .order('updated_at')

    if (error) {
      console.error('Error fetching advertisements for sitemap:', error)
      return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
    }

    const staticPages = [
      { url: '', changefreq: 'daily', priority: 1.0 },
      { url: '/anunturi', changefreq: 'hourly', priority: 0.9 },
      { url: '/cauta', changefreq: 'daily', priority: 0.8 },
      { url: '/despre-noi', changefreq: 'monthly', priority: 0.7 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/termeni-si-conditii', changefreq: 'yearly', priority: 0.5 },
      { url: '/politica-confidentialitate', changefreq: 'yearly', priority: 0.5 },
      { url: '/ajutor', changefreq: 'monthly', priority: 0.6 },
      { url: '/cont', changefreq: 'daily', priority: 0.7 },
      { url: '/adauga-anunt', changefreq: 'daily', priority: 0.8 },
      { url: '/favorite', changefreq: 'daily', priority: 0.7 }
    ]

    // Generate category pages (you might want to make this dynamic based on your categories)
    const categories = ['SUV', 'Sedan', 'Hatchback', 'Break', 'Coupe', 'Cabrio', 'Monovolum', 'Pickup']
    const categoryPages = categories.map(category => ({
      url: `/categorie/${category.toLowerCase()}`,
      changefreq: 'daily',
      priority: 0.8
    }))

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Static pages -->
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  
  <!-- Category pages -->
  ${categoryPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  
  <!-- Advertisement pages -->
  ${advertisements && advertisements.length > 0 ? advertisements.map((ad: any) => `
  <url>
    <loc>${baseUrl}/anunturi/${(ad as any).id}</loc>
    <lastmod>${new Date((ad as any).updated_at || (ad as any).created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') : ''}
  
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}