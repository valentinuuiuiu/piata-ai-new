import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termeni & Condiții - Piata AI RO',
  description: 'Termenii și condițiile de utilizare a platformei Piata AI RO',
  keywords: ['termeni', 'conditii', 'utilizare', 'piata ai ro', 'platforma', 'servicii'],
  openGraph: {
    title: 'Termeni & Condiții - Piata AI RO',
    description: 'Termenii și condițiile de utilizare a platformei Piata AI RO',
    images: [
      {
        url: '/images/og/termeni.jpg',
        width: 1200,
        height: 630,
        alt: 'Termeni & Condiții - Piata AI RO'
      }
    ]
  }
};

export default function TermeniConditii() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Termeni &{' '}
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] bg-clip-text text-transparent">
              Condiții
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Regulile care guvernează utilizarea platformei noastre
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span>Ultima actualizare: 24 noiembrie 2024</span>
            <span>•</span>
            <span>Citește cu atenție înainte de utilizare</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptarea Termenilor</h2>
                <p className="text-gray-300 leading-relaxed">
                  Prin accesarea sau utilizarea platformei Piata AI RO, sunteți de acord să respectați 
                  și să fiți supus termenilor și condițiilor de utilizare. Dacă nu sunteți de acord 
                  cu acești termeni, vă rugăm să nu accesați sau să utilizați platforma.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. Definiții</h2>
                <ul className="text-gray-300 space-y-2">
                  <li><strong>Platformă:</strong> Site-ul web piata-ai.ro și serviciile asociate</li>
                  <li><strong>Utilizator:</strong> Orice persoană fizică sau juridică care accesează platforma</li>
                  <li><strong>Cont:</strong> Contul de utilizator creat pentru accesarea platformei</li>
                  <li><strong>Conținut:</strong> Informațiile, datele, textele, imagini și alte materiale</li>
                  <li><strong>Servicii:</strong> Serviciile oferite prin platformă, inclusiv AI features</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">3. Crearea Contului</h2>
                <p className="text-gray-300 leading-relaxed">
                  Pentru a utiliza anumite funcții ale platformei, trebuie să creați un cont. 
                  Sunteți responsabil pentru menținerea confidențialității datelor de autentificare 
                  și pentru toate activitățile care au loc din contul dvs.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Condiții de utilizare:</strong>
                </p>
                <ul className="text-gray-300 space-y-1 mt-2">
                  <li>Sunteți cel puțin major (18 ani)</li>
                  <li>Furnizați informații adevărate, exacte, actuale și complete</li>
                  <li>Vă actualizați imediat informațiile dacă acestea devin inexacte</li>
                  <li>Vă asumați întreaga responsabilitate pentru confidențialitatea contului</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">4. Utilizarea Platformei</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Utilizare permisă:</strong> Platforma poate fi utilizată exclusiv pentru 
                  scopuri legale și în conformitate cu toate legile și reglementările aplicabile.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Utilizare interzisă:</strong> Este strict interzis:
                </p>
                <ul className="text-gray-300 space-y-1 mt-2">
                  <li>Orice activitate ilegală, frauduloasă sau neautorizată</li>
                  <li>Încălcarea drepturilor de proprietate intelectuală</li>
                  <li>Distribuirea de conținut ilegal, ofensator sau periculos</li>
                  <li>Încercarea de a obține acces neautorizat la sistem sau date</li>
                  <li>Utilizarea platformei pentru activități comerciale neautorizate</li>
                  <li>Orice altă utilizare care poate dauna platformei sau utilizatorilor</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">5. Conținutul Utilizatorilor</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Proprietatea conținutului:</strong> Dvs. dețineți toate drepturile de 
                  proprietate asupra conținutului pe care îl postați pe platformă.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Licența:</strong> Prin postarea conținutului, acordați platformei o 
                  licență neexclusivă, mondială, taxată, transferabilă și sub-licențiabilă 
                  pentru utilizarea, afișarea, distribuirea și promovarea conținutului.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Responsabilitatea conținutului:</strong> Sunteti singurul responsabil 
                  pentru conținutul pe care îl postați și pentru orice consecințe care decurg 
                  din postarea acestuia.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">6. Serviciile AI</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Utilizare AI:</strong> Serviciile de inteligență artificială sunt 
                  oferite "așa cum sunt" și nu garantează rezultate specifice.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Responsabilitate utilizator:</strong> Utilizatorii sunt responsabili 
                  pentru verificarea și validarea oricăror rezultate generate de AI înainte de 
                  a le utiliza în decizii importante.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Conținut generat de AI:</strong> Platforma poate genera conținut 
                  automat care trebuie revizuit și aprobat de utilizatori înainte de publicare.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">7. Plăți și Credite</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Pachete de credite:</strong> Creditele achiziționate nu pot fi 
                  rambursate, cu excepția prevăzută de lege.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Prețuri:</strong> Prețurile pot fi modificate în orice moment. 
                  Modificările nu vor afecta achizițiile deja efectuate.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Taxare:</strong> Toate prețurile includ TVA, dacă este cazul.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">8. Proprietate Intelectuală</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Drepturi platformă:</strong> Platforma și toate elementele sale 
                  (excluzând conținutul utilizatorilor) sunt proprietatea noastră și sunt 
                  protejate de legile privind drepturile de autor.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Licență utilizare:</strong> Vă acordăm o licență limitată, 
                  neexclusivă, ne-transferabilă pentru utilizarea platformei în 
                  conformitate cu acești termeni.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">9. Limitarea Răspunderii</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Platforma "așa cum este":</strong> Platforma este oferită "așa cum 
                  este" și "așa cum este disponibilă". Nu oferim garanții cu privire la 
                  funcționarea neîntreruptă, sigură sau fără erori a platformei.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Lipsa garanții:</strong> Nu garantăm că platforma va satisface 
                  cerințele dvs. sau că defectele vor fi corectate.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Limitare daune:</strong> În niciun caz nu vom fi răspunzători 
                  pentru daunele indirecte, incidentale, speciale, exemplare sau consecutive.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">10. Confidențialitate</h2>
                <p className="text-gray-300 leading-relaxed">
                  Prezii termeni trebuie citiți împreună cu Politica de Confidențialitate 
                  a platformei, care explică cum colectăm, utilizăm și protejăm datele 
                  cu caracter personal.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">11. Modificări ale Termenilor</h2>
                <p className="text-gray-300 leading-relaxed">
                  Ne rezervăm dreptul de a modifica acești termeni în orice moment. 
                  Vom publica orice modificări semnificative cu cel puțin 30 de zile 
                  înainte de intrarea lor în vigoare.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  Este responsabilitatea dvs. să verificați periodic acești termeni 
                  pentru modificări. Utilizarea continuă a platformei după publicarea 
                  modificărilor constituie acceptarea acestora.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">12. Încetarea Contractului</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>De către utilizator:</strong> Puteți înceta utilizarea platformei 
                  în orice moment.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>De către platformă:</strong> Ne rezervăm dreptul de a suspenda 
                  sau închide contul dvs. în orice moment, fără notificare prealabilă, 
                  dacă considerăm că ați încălcat acești termeni.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Supraviețuirea:</strong> Dispozițiile privind proprietatea 
                  intelectuală, confidențialitatea, limitarea răspunderii și 
                  litigiile supraviețuiesc oricărei încetări.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">13. Litigii</h2>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Legea aplicabilă:</strong> Acești termeni sunt guvernați de 
                  legislația României.
                </p>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong>Competența:</strong> Orice litigiu care decurge din sau în 
                  legătură cu acești termeni va fi soluționat exclusiv de instanțele 
                  competente din România.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">14. Contact</h2>
                <p className="text-gray-300 leading-relaxed">
                  Pentru orice întrebări privind acești termeni, vă puteți adresa:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-300">
                    <strong>Email:</strong> legal@piata.ro
                  </p>
                  <p className="text-gray-300">
                    <strong>Adresă:</strong> Sediul Social, București, România
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}