import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCreditsWidget from '@/components/FloatingCreditsWidget';
import PAIHelper from '@/components/PAIHelper';
import SuggestionWidget from '@/components/SuggestionWidget';
import SacredSpace from '@/components/SacredSpace';
import ErrorBoundary from '@/components/ErrorBoundary';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { LayoutStructuredData } from '@/components/LayoutStructuredData';
// Initialize automation engine
import { automationEngine } from '@/lib/automation-engine';

export const metadata: Metadata = {
  title: 'Piata AI RO - Piața Inteligentă din România | Anunțuri Online cu AI',
  description: 'Piața online românească cu AI. Cumpără și vinde cu încredere. Respect pentru oameni, date private, soluții reale pentru probleme reale. Anunțuri imobiliare, auto, electronice.',
  keywords: 'piața online românia, anunțuri românia, cumpărare vânzare, imobiliare, auto, electronice, servicii, piață cu AI, anunțuri gratuite',
  authors: [{ name: 'Piata AI RO' }],
  creator: 'Piata AI RO',
  publisher: 'Piata AI RO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://piata-ai.ro'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Piata AI RO - Piața Inteligentă din România',
    description: 'Piața online românească cu AI. Respect pentru oameni, date private, soluții reale pentru probleme reale.',
    url: 'https://piata-ai.ro',
    siteName: 'Piata AI RO',
    locale: 'ro_RO',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Piata AI RO - Piața Inteligentă din România',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Piata AI RO - Piața Inteligentă din România',
    description: 'Piața online românească cu AI. Respect pentru oameni, date private, soluții reale pentru probleme reale.',
    images: ['/og-image.jpg'],
    creator: '@piataai_ro',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        {/* Structured data injected via useEffect in RootLayoutWrapper component */}
      </head>
      <body className="min-h-screen bg-primary text-white antialiased">
        <LayoutStructuredData />
        <ErrorBoundary>
          <Navbar />
          <main className="pt-20 pb-12 relative z-10 container mx-auto px-4">
            {children}
          </main>
          <Footer />
          <FloatingCreditsWidget />
          <PAIHelper />
          <SuggestionWidget />
          <SacredSpace />
          <PerformanceMonitor />
        </ErrorBoundary>
      </body>
    </html>
  );
}
