import { Metadata } from 'next'
import { Advertisement } from '@/types/advertisement'

interface OpenGraphData {
  title: string
  description: string
  url: string
  images?: Array<{url: string, width?: number, height?: number, alt?: string}>
  type?: string
  siteName?: string
  locale?: string
}

interface TwitterCardData {
  card: 'summary' | 'summary_large_image'
  title: string
  description: string
  image?: string
  site?: string
  creator?: string
}

export function generateOpenGraphTags(data: OpenGraphData): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  
  const tags: Record<string, string> = {
    'og:title': data.title,
    'og:description': data.description,
    'og:url': data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`,
    'og:type': data.type || 'website',
    'og:site_name': data.siteName || 'Piața Automobil',
    'og:locale': data.locale || 'ro_RO'
  }

  if (data.images && data.images.length > 0) {
    data.images.forEach((image, index) => {
      const imageUrl = image.url.startsWith('http') ? image.url : `${baseUrl}${image.url}`
      tags[`og:image${index === 0 ? '' : `:${index}`}`] = imageUrl
      if (image.width) tags[`og:image${index === 0 ? '' : `:${index}`}:width`] = image.width.toString()
      if (image.height) tags[`og:image${index === 0 ? '' : `:${index}`}:height`] = image.height.toString()
      if (image.alt) tags[`og:image${index === 0 ? '' : `:${index}`}:alt`] = image.alt
    })
  }

  return tags
}

export function generateTwitterCardTags(data: TwitterCardData): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  
  const tags: Record<string, string> = {
    'twitter:card': data.card,
    'twitter:title': data.title,
    'twitter:description': data.description
  }

  if (data.image) {
    tags['twitter:image'] = data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`
  }

  if (data.site) tags['twitter:site'] = data.site
  if (data.creator) tags['twitter:creator'] = data.creator

  return tags
}

export function generateAdvertisementMetadata(advertisement: Advertisement): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  const url = `${baseUrl}/anunturi/${advertisement.id}`
  
  const title = `${advertisement.title} - ${advertisement.brand} ${advertisement.model} | Piața Automobil`
  const description = `${advertisement.description?.substring(0, 160) || ''}${advertisement.description && advertisement.description.length > 160 ? '...' : ''}`
  
  const openGraphData: OpenGraphData = {
    title,
    description,
    url,
    type: 'product',
    siteName: 'Piața Automobil',
    locale: 'ro_RO',
    images: advertisement.images?.slice(0, 3).map((img, index) => ({
      url: img.url,
      width: 1200,
      height: 800,
      alt: `${advertisement.brand} ${advertisement.model} - Imagine ${index + 1}`
    })) || []
  }

  const twitterData: TwitterCardData = {
    card: 'summary_large_image',
    title,
    description,
    image: advertisement.images?.[0]?.url,
    site: '@piataautomobil',
    creator: '@piataautomobil'
  }

  const openGraphTags = generateOpenGraphTags(openGraphData)
  const twitterTags = generateTwitterCardTags(twitterData)

  return {
    title,
    description,
    openGraph: {
      type: (openGraphData.type as any) || 'website',
      siteName: openGraphData.siteName,
      locale: openGraphData.locale,
      title: openGraphData.title,
      description: openGraphData.description,
      url: openGraphData.url,
      images: openGraphData.images
    },
    twitter: {
      card: twitterData.card,
      title: twitterData.title,
      description: twitterData.description,
      images: twitterData.image ? [twitterData.image] : [],
      site: twitterData.site,
      creator: twitterData.creator
    },
    alternates: {
      canonical: url
    },
    other: {
      ...openGraphTags,
      ...twitterTags,
      'product:brand': advertisement.brand || '',
      'product:condition': 'used',
      'product:price:amount': advertisement.price?.toString() || '',
      'product:price:currency': 'EUR',
      'product:availability': advertisement.status === 'published' ? 'in stock' : 'out of stock',
      'product:category': 'Automobile',
      'product:subcategory': `${advertisement.brand} ${advertisement.model}`,
      'automotive:model': advertisement.model || '',
      'automotive:brand': advertisement.brand || '',
      'automotive:year': advertisement.year?.toString() || '',
      'automotive:mileage': advertisement.mileage?.toString() || '',
      'automotive:fuel_type': advertisement.fuelType || '',
      'automotive:transmission': advertisement.transmission || '',
      'automotive:body_type': advertisement.bodyType || '',
      'automotive:color': advertisement.color || '',
      'automotive:engine_displacement': advertisement.engineCapacity?.toString() || '',
      'automotive:engine_power': advertisement.power?.toString() || '',
      'automotive:drivetrain': advertisement.drivetrain || '',
      'automotive:doors': advertisement.doors?.toString() || '',
      'automotive:seats': advertisement.seats?.toString() || '',
      'automotive:vin': advertisement.vin || '',
      'automotive:first_registration': advertisement.firstRegistrationDate || '',
      'location:country': 'RO',
      'location:region': 'România'
    }
  }
}

export function generateHomepageMetadata(): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  
  const title = 'Piața Automobil | Cel mai mare marketplace auto din România'
  const description = 'Descoperă mii de automobile noi și second-hand la cele mai bune prețuri. Vânzători verificați, fotografii reale și informații complete. Cumpără sau vinde mașini în siguranță.'
  
  const openGraphData: OpenGraphData = {
    title,
    description,
    url: baseUrl,
    type: 'website',
    siteName: 'Piața Automobil',
    locale: 'ro_RO',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Piața Automobil - Marketplace auto România'
    }]
  }

  const twitterData: TwitterCardData = {
    card: 'summary_large_image',
    title,
    description,
    image: '/og-image.jpg',
    site: '@piataautomobil',
    creator: '@piataautomobil'
  }

  return {
    title,
    description,
    keywords: 'automobile, masini, vanzari auto, marketplace, second hand, masini second hand, vanzari masini, romania',
    openGraph: {
      type: (openGraphData.type as any) || 'website',
      siteName: openGraphData.siteName,
      locale: openGraphData.locale,
      title: openGraphData.title,
      description: openGraphData.description,
      url: openGraphData.url,
      images: openGraphData.images
    },
    twitter: {
      card: twitterData.card,
      title: twitterData.title,
      description: twitterData.description,
      images: twitterData.image ? [twitterData.image] : [],
      site: twitterData.site,
      creator: twitterData.creator
    },
    alternates: {
      canonical: baseUrl
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}

export function generateCategoryMetadata(category: string, count?: number): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  const url = `${baseUrl}/categorie/${category}`
  
  const title = `${category} | Piața Automobil`
  const description = `Descoperă ${count ? `${count} ` : ''}automobile ${category.toLowerCase()} la cele mai bune prețuri. Vânzători verificați și informații complete pentru fiecare vehicul.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website'
    },
    twitter: {
      card: 'summary',
      title,
      description
    },
    alternates: {
      canonical: url
    }
  }
}