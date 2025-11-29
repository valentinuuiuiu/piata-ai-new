import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Echipa Noastră - Piata AI RO',
  description: 'Cunoaște echipa pasionată care stă în spatele celei mai inovatoare platforme AI din România',
  keywords: ['echipa', 'piata ai ro', 'team', 'angajati', 'cariere', 'companie'],
  openGraph: {
    title: 'Echipa Noastră - Piata AI RO',
    description: 'Cunoaște echipa pasionată care stă în spatele celei mai inovatoare platforme AI din România',
    images: [
      {
        url: '/images/og/echipa.jpg',
        width: 1200,
        height: 630,
        alt: 'Echipa Noastră - Piata AI RO'
      }
    ]
  }
};

const teamMembers = [
  {
    name: 'Shivoham Ionuț',
    role: 'Fondator & CEO',
    image: '/images/team/shivoham.jpg',
    bio: 'Visionarul care a visat o Românie unde tehnologia servește oamenilor, nu invers. Pasionat de AI, conștientizare și libertate digitală.',
    expertise: ['Strategică', 'AI & ML', 'Blockchain', 'Conștientizare'],
    email: 'shivoham@piata.ro',
    linkedin: 'https://linkedin.com/in/shivoham',
    quote: "Tehnologia trebuie să ne ridice, nu să ne controleze."
  },
  {
    name: 'Dr. Elena Mihai',
    role: 'CTO & AI Lead',
    image: '/images/team/elena.jpg',
    bio: 'Doctor în Informatică cu specializare în învățare automată. Expertă în arhitecturi AI și soluții scalabile.',
    expertise: ['Machine Learning', 'Deep Learning', 'Cloud Architecture', 'Research'],
    email: 'elena@piata.ro',
    linkedin: 'https://linkedin.com/in/elena-mihai',
    quote: "AI should be accessible, ethical, and beneficial for everyone."
  },
  {
    name: 'Alexandru Popescu',
    role: 'Lead Developer',
    image: '/images/team/alexandru.jpg',
    bio: 'Full-stack developer cu experiență în construirea de platforme la scară mondială. Specialist în Next.js și arhitecturi moderne.',
    expertise: ['Next.js', 'TypeScript', 'Node.js', 'DevOps', 'Performance'],
    email: 'alex@piata.ro',
    github: 'https://github.com/alexpopescu',
    quote: "Good code is not just functional, it's beautiful and maintainable."
  },
  {
    name: 'Maria Ionescu',
    role: 'UX/UI Designer',
    image: '/images/team/maria.jpg',
    bio: 'Designer cu pasiune pentru experiențe utilizator memorabile. Crede că frumusețea și funcționalitatea trebuie să meargă mână în mână.',
    expertise: ['UI/UX Design', 'User Research', 'Prototyping', 'Accessibility'],
    email: 'maria@piata.ro',
    behance: 'https://behance.net/mariaionescu',
    quote: "Design is not just what it looks like, it's how it works."
  },
  {
    name: 'Răzvan Georgescu',
    role: 'AI Researcher',
    image: '/images/team/razvan.jpg',
    bio: 'Cercetător în domeniul inteligenței artificiale generative. Publicat articole științifice și colaborat cu universități din UE.',
    expertise: ['Generative AI', 'NLP', 'Research', 'Algorithms'],
    email: 'razvan@piata.ro',
    googleScholar: 'https://scholar.google.com/citations?user=razvan-georgescu',
    quote: "The future of AI is not about replacing humans, but enhancing human potential."
  },
  {
    name: 'Cristina Dumitru',
    role: 'Community Manager',
    image: '/images/team/cristina.jpg',
    bio: 'Ambasadorul comunității noastre. Pasiunea ei pentru oameni și comunicare a transformat userii într-o comunitate strâns legată.',
    expertise: ['Community Building', 'Social Media', 'Content Strategy', 'Events'],
    email: 'cristina@piata.ro',
    instagram: 'https://instagram.com/cristina.dumitru',
    quote: "Our community is our greatest asset and inspiration."
  }
];

const advisors = [
  {
    name: 'Prof. Dr. Andrei Radu',
    role: 'AI Advisor',
    affiliation: 'Universitatea Politehnica București',
    expertise: 'Machine Learning & Computer Vision'
  },
  {
    name: 'Loredana Stancu',
    role: 'Business Advisor',
    affiliation: 'Serial Entrepreneur',
    expertise: 'Scale-up & Fundraising'
  },
  {
    name: 'Mihai Barbu',
    role: 'Legal Advisor',
    affiliation: 'Senior Lawyer',
    expertise: 'Tech Law & GDPR'
  }
];

export default function Echipa() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00f0ff]/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Echipa{' '}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent">
              Noastră
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
            O echipă pasionată, diversă și talentată, unită de o viziune comună: 
            să facă România un lider în domeniul inteligenței artificiale
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00f0ff] rounded-full"></span>
              12 membri
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff00f0] rounded-full"></span>
              4 țări reprezentate
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00ff88] rounded-full"></span>
              50+ ani experiență combinată
            </span>
          </div>
        </div>
      </section>

      {/* Core Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fundatorii & Liderii
            </h2>
            <p className="text-gray-400 text-lg">Mintea creatoare care conduce viziunea noastră</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.slice(0, 3).map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#00f0ff]/50 transition-all duration-300 group-hover:scale-105">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                      />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">⭐</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-[#00f0ff] font-semibold mb-4">{member.role}</p>
                    
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Expertiză:</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill) => (
                          <span 
                            key={skill}
                            className="px-2 py-1 bg-[#00f0ff]/20 text-[#00f0ff] text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-gray-300 text-sm italic mb-4">
                      "{member.quote}"
                    </blockquote>
                    
                    <div className="flex justify-center gap-3">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-[#00f0ff] transition-colors">
                          <span className="text-sm">📧</span>
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00f0ff] transition-colors">
                          <span className="text-sm">💼</span>
                        </a>
                      )}
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00f0ff] transition-colors">
                          <span className="text-sm">💻</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Team */}
      <section className="py-20 bg-gradient-to-r from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Echipa Tehnică
            </h2>
            <p className="text-gray-400 text-lg">Talentele care transformă viziunea în realitate</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.slice(3).map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#ff00f0]/50 transition-all duration-300 group-hover:scale-105">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                      />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-[#ff00f0] font-semibold mb-4 text-sm">{member.role}</p>
                    
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                      {member.bio}
                    </p>
                    
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {member.expertise.map((skill) => (
                          <span 
                            key={skill}
                            className="px-1 py-0.5 bg-[#ff00f0]/20 text-[#ff00f0] text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-[#ff00f0] transition-colors">
                          <span className="text-sm">📧</span>
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff00f0] transition-colors">
                          <span className="text-sm">💼</span>
                        </a>
                      )}
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff00f0] transition-colors">
                          <span className="text-sm">💻</span>
                        </a>
                      )}
                      {member.behance && (
                        <a href={member.behance} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff00f0] transition-colors">
                          <span className="text-sm">🎨</span>
                        </a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff00f0] transition-colors">
                          <span className="text-sm">📸</span>
                        </a>
                      )}
                      {member.googleScholar && (
                        <a href={member.googleScholar} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ff00f0] transition-colors">
                          <span className="text-sm">📚</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisors */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Consilierii Noștri
            </h2>
            <p className="text-gray-400 text-lg">Experți de top care ne ghidă și inspiră</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {advisors.map((advisor, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#00ff88]/50 transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00ff88] to-[#ffaa00] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-[#00ff88]/20">
                    <span className="text-2xl">🧠</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{advisor.name}</h3>
                  <p className="text-[#00ff88] font-semibold mb-2 text-sm">{advisor.role}</p>
                  <p className="text-gray-400 text-sm mb-3">{advisor.affiliation}</p>
                  <p className="text-gray-400 text-xs">Expert în: {advisor.expertise}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-20 bg-gradient-to-r from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cultura Noastră
            </h2>
            <p className="text-gray-400 text-lg">Ce înseamnă să faci parte din echipa noastră</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00f0ff]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00f0ff] text-lg">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Inovație Continuă</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Încurajăm experimentarea, învățarea și implementarea de tehnologii noi. 
                      Fiecare membru are oportunitatea de a lucra la proiecte inovatoare.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff00f0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ff00f0] text-lg">🌏</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Limbă Globală</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Oferim oportunități de lucru cu parteneri internaționali și de participare 
                      la conferințe și evenimente din întreaga lume.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00ff88]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00ff88] text-lg">🎓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Dezvoltare Profesională</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Investim în dezvoltarea echipei prin cursuri, certificări, 
                      conferințe și mentori. Fiecare membru are un buget anual pentru dezvoltare.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ffaa00]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ffaa00] text-lg">💙</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Work-Life Balance</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Promovăm un mediu sănătos cu program flexibil, zile libere nelimitate 
                      și sprijin pentru echilibrul dintre muncă și viața personală.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="relative">
                <img 
                  src="/images/team-culture.jpg" 
                  alt="Team Culture" 
                  className="rounded-2xl shadow-2xl"
                  width={500}
                  height={350}
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-white px-4 py-2 rounded-full">
                  <span className="text-sm font-bold">95%</span>
                  <span className="text-xs opacity-90 ml-1">angajați fericiți</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Alătură-te Echipei Noastre
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Cautăm oameni pasionați, talentați și dornici să facă diferența. 
            Dacă vrei să faci parte din revoluția AI din România, suntem dispuși să te ascultăm.
          </p>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Locuri Disponibile</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00f0ff] rounded-full"></span>
                    Senior AI Engineer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ff00f0] rounded-full"></span>
                    UX/UI Designer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00ff88] rounded-full"></span>
                    DevOps Engineer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ffaa00] rounded-full"></span>
                    Community Manager
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Beneficii</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00f0ff] rounded-full"></span>
                    Asigurare medicală completă
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ff00f0] rounded-full"></span>
                    Program flexibil de muncă
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00ff88] rounded-full"></span>
                    Buget dezvoltare personală
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ffaa00] rounded-full"></span>
                    Evenimente team building
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8">
              <a 
                href="/cariere" 
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#00f0ff]/20 transition-all duration-300"
              >
                <span>Explorează Cariere</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}