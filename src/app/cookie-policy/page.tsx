export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1>Politica Cookie-urilor</h1>

      <p>
        Piața AI folosește cookie-uri și tehnologii similare pentru a oferi o experiență sigură
        și personalizată. Această pagină explică ce cookie-uri folosim și cum poți controla
        preferințele tale.
      </p>

      <h2>Tipuri de cookie-uri</h2>
      <ul>
        <li>Cookie-uri esențiale – necesare pentru funcționarea site-ului (autentificare, sesiune).</li>
        <li>Cookie-uri de performanță – colectează date anonime despre utilizare pentru optimizare.</li>
        <li>Cookie-uri funcționale – păstrează preferințele utilizatorului.</li>
        <li>Cookie-uri de marketing – (opțional) pentru campanii externe, analytics și remarketing.</li>
      </ul>

      <h2>Listări tehnice</h2>
      <p>
        Notă tehnică: listmonk (newsletter) are setări pentru cookie-uri în `listmonk/config.toml`.
        De exemplu, `cookie_http_only = true` și `cookie_secure` pot fi configurate în producție.
      </p>

      <h2>Controlul cookie-urilor</h2>
      <p>
        Poți controla și șterge cookie-urile din setările browserului tău. Instrucțiunile variază
        în funcție de browser (Chrome, Firefox, Edge, Safari). Pentru cookie-uri non-esențiale
        oferim opțiune de opt-out din setările contului sau modulul de preferințe (dacă e activ).
      </p>

      <h2>Contact</h2>
      <p>
        Dacă ai întrebări despre cookie-uri, contactează-ne la <a href="/contact">Contact</a>.
      </p>
    </main>
  );
}
