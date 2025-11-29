import { Advertisement } from '@/types/advertisement'

export function generateStructuredData(advertisement: Advertisement) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: advertisement.title,
    description: advertisement.description,
    brand: advertisement.brand ? {
      '@type': 'Brand',
      name: advertisement.brand
    } : undefined,
    model: advertisement.model,
    vehicleConfiguration: advertisement.trimLevel,
    vehicleIdentificationNumber: advertisement.vin,
    productionDate: advertisement.year ? `${advertisement.year}-01-01` : undefined,
    purchaseDate: advertisement.firstRegistrationDate,
    fuelType: advertisement.fuelType,
    vehicleEngine: {
      '@type': 'EngineSpecification',
      engineType: advertisement.fuelType,
      engineDisplacement: advertisement.engineCapacity ? `${advertisement.engineCapacity} L` : undefined,
      enginePower: advertisement.power ? {
        '@type': 'QuantitativeValue',
        value: advertisement.power,
        unitText: 'kW'
      } : undefined
    },
    mileageFromOdometer: advertisement.mileage ? {
      '@type': 'QuantitativeValue',
      value: advertisement.mileage,
      unitText: 'km'
    } : undefined,
    bodyType: advertisement.bodyType,
    vehicleTransmission: advertisement.transmission,
    driveWheelConfiguration: advertisement.drivetrain,
    color: advertisement.color,
    numberOfDoors: advertisement.doors,
    vehicleSeatingCapacity: advertisement.seats,
    offers: {
      '@type': 'Offer',
      price: advertisement.price,
      priceCurrency: 'EUR',
      availability: advertisement.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Person',
        name: advertisement.contact?.name || 'Vânzător particular'
      },
      url: `${baseUrl}/anunturi/${advertisement.id}`,
      validFrom: advertisement.createdAt
    },
    image: advertisement.images?.map(img => img.url) || [],
    url: `${baseUrl}/anunturi/${advertisement.id}`,
    datePosted: advertisement.createdAt,
    dateModified: advertisement.updatedAt,
    category: 'Automobile',
    additionalProperty: [
      ...(advertisement.features?.map(feature => ({
        '@type': 'PropertyValue',
        name: 'Caracteristică',
        value: feature
      })) || []),
      ...(advertisement.equipment?.map(equipment => ({
        '@type': 'PropertyValue',
        name: 'Echipament',
        value: equipment
      })) || [])
    ]
  }
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

export function generateWebsiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Piața Automobil',
    description: 'Cel mai mare marketplace pentru automobile din România',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/cauta?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Piața Automobil',
      url: baseUrl
    }
  }
}

export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Piața Automobil',
    description: 'Platformă online pentru cumpărarea și vânzarea de automobile în România',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Romanian'
    },
    sameAs: [
      // Add social media URLs if available
    ]
  }
}

export function generateLocalBusinessStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piata-automobil.ro'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Piața Automobil',
    description: 'Marketplace online pentru automobile',
    url: baseUrl,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RO',
      addressRegion: 'România'
    },
    openingHours: 'Mo-Su 00:00-23:59',
    availableLanguage: ['Romanian']
  }
}