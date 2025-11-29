import { NextResponse } from 'next/server'

export function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Prioritize important pages
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /cont/?
Disallow: /adauga-anunt
Disallow: /mesaje/
Disallow: /notificari/

# Allow specific API endpoints for SEO
Allow: /api/anunturi
Allow: /api/search

# Sitemap location
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'}/sitemap.xml

# Special instructions for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

# Block unwanted bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: BacklinkCrawler
Disallow: /`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  })
}