import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Despre Noi - Piata AI RO',
  description: 'Descoperă povestea din spatele celei mai inovatoare platforme AI din România',
  keywords: ['despre noi', 'piata ai ro', 'echipa', 'misie', 'viziune', 'companie'],
  openGraph: {
    title: 'Despre Noi - Piata AI RO',
    description: 'Descoperă povestea din spatele celei mai inovatoare platforme AI din România',
    images: [
      {
        url: '/images/og/despre-noi.jpg',
        width: 1200,
        height: 630,
        alt: 'Despre Noi - Piata AI RO'
      }
    ]
  }
};

export default function DespreNoi() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#00f0ff]/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Despre{' '}
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent">
                Noi
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Revoluționăm comerțul online prin inteligență artificială, 
              conștientizare și tehnologie de ultimă generație
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>📍 București, România</span>
              <span>•</span>
              <span>🚀 Fondată în 2024</span>
              <span>•</span>
              <span>🧠 AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-r from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Misiunea Noastră
              </h2>
              <div className="space-y-6 text-gray-300">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#00f0ff]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#00f0ff] text-sm">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Democratizarea AI</h3>
                    <p>Facem inteligența artificială accesibilă tuturor românilor, 
                    nu doar celor cu bugeturi uriașe sau expertiză tehnică.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#ff00f0]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#ff00f0] text-sm">💡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Inovație Transparentă</h3>
                    <p>Construim tehnologie etică, transparentă și prietenoasă 
                    cu datele utilizatorilor, bazată pe principii open-source.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#00ff88]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#00ff88] text-sm">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Impact Local</h3>
                    <p>Sprijinim comunitățile locale, antreprenorii și micile 
                    afaceri să profite de revoluția AI fără bariere.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="relative">
                <img 
                  src="/images/despre-hero.jpg" 
                  alt="Piata AI RO Team" 
                  className="rounded-2xl shadow-2xl"
                  width={600}
                  height={400}
                />
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-white px-6 py-3 rounded-full">
                  <span className="text-sm font-bold">1000+</span>
                  <span className="text-xs opacity-90 ml-2">utilizatori activi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Povestea Noastră
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              De la o idee simplă la cea mai avansată platformă AI din România
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00f0ff] via-[#ff00f0] to-[#00ff88] transform -translate-x-1/2"></div>
            
            <div className="space-y-12">
              <div className="relative lg:ml-8 lg:pl-16">
                <div className="absolute left-0 top-8 w-16 h-16 bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] rounded-full flex items-center justify-center transform -translate-x-1/2">
                  <span className="text-white text-sm">2024</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Începuturile</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Totul a început dintr-o simplă observație: piața românească 
                    avea nevoie de o soluție modernă, prietenoasă și accesibilă. 
                    Am văzut oportunitatea de a combina inteligența artificială 
                    cu nevoile reale ale oamenilor.
                  </p>
                </div>
              </div>

              <div className="relative lg:mr-8 lg:pr-16">
                <div className="absolute right-0 top-8 w-16 h-16 bg-gradient-to-r from-[#ff00f0] to-[#00ff88] rounded-full flex items-center justify-center transform translate-x-1/2">
                  <span className="text-white text-sm">2024</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Dezvoltarea</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Am adunat o echipă pasionată de tehnologie, design și business. 
                    Am petrecut luni de zile cercetând, testând și optimizând 
                    fiecare aspect al platformei. Am învățat de la primii utilizatori 
                    și am construit cea ce este astăzi cea mai avansată platformă AI.
                  </p>
                </div>
              </div>

              <div className="relative lg:ml-8 lg:pl-16">
                <div className="absolute left-0 top-8 w-16 h-16 bg-gradient-to-r from-[#00ff88] to-[#ffaa00] rounded-full flex items-center justify-center transform -translate-x-1/2">
                  <span className="text-white text-sm">2024</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-4">Lansare</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Astăzi, suntem mândri să oferim celor mai inovatoare soluții 
                    AI românilor de pretutindeni. Continuăm să învățăm, să evoluăm 
                    și să construim viitorul comerțului online, împreună cu comunitatea noastră.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-r from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Valorile Noastre
            </h2>
            <p className="text-gray-400 text-lg">Principiile care ne ghidează în fiecare decizie</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#00f0ff]/20">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Securitate & Confidențialitate</h3>
              <p className="text-gray-400 leading-relaxed">
                Datele utilizatorilor sunt protejate cu cele mai avansate tehnologii. 
                Nu vindem, nu închiriem și nu exploatăm informațiile personale.
              </p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-r from-[#00ff88] to-[#ffaa00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#00ff88]/20">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Inovație Responsabilă</h3>
              <p className="text-gray-400 leading-relaxed">
                Adoptăm tehnologii noi cu grijă, testând riguros impactul asupra utilizatorilor 
                și societății înainte de implementare.
              </p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-r from-[#ffaa00] to-[#ff6b9d] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#ffaa00]/20">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Comunitate & Transparență</h3>
              <p className="text-gray-400 leading-relaxed">
                Suntem deschiși, onest și implicați activ în comunitatea tech românească. 
                Credem în puterea colaborării și a open-source-ului.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Impactul Nostru
            </h2>
            <p className="text-gray-400 text-lg">Rezultatele pe care le-am obținut împreună</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-[#00f0ff] mb-2">2,847</div>
              <div className="text-gray-400 text-sm">Utilizatori Activi</div>
            </div>
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-[#ff00f0] mb-2">15,492</div>
              <div className="text-gray-400 text-sm">Anunțuri Postate</div>
            </div>
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-[#00ff88] mb-2">124.5K</div>
              <div className="text-gray-400 text-sm">RON Schimbate</div>
            </div>
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-[#ffaa00] mb-2">98.7%</div>
              <div className="text-gray-400 text-sm">Satisfacție Utilizatori</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}