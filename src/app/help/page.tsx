export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1>Centru Ajutor</h1>

      <p>
        Ai la dispoziție resursele de mai jos pentru a găsi rapid soluții. Dacă nu găsești ceea ce cauți,
        contactează suportul folosind pagina <a href="/contact">Contact</a>.
      </p>

      <h2>Resurse rapide</h2>
      <ul>
        <li><a href="/faq">FAQ — Întrebări frecvente</a></li>
        <li><a href="/ghid">Ghid Utilizare — Tutoriale pas cu pas</a></li>
        <li><a href="/suport">Suport Tehnic — Contact direct</a></li>
        <li><a href="/api-docs">API — Documentație pentru dezvoltatori</a></li>
        <li><a href="/forum">Forum Comunitate — Discuții și feedback</a></li>
      </ul>

      <h2>Contact</h2>
      <p>Pentru probleme tehnice sau întrebări legate de cont, folosește <a href="/contact">formularul de contact</a>.</p>

      <h2>Politici & Securitate</h2>
      <p>Vezi <a href="/confidentialitate">Politica de confidențialitate</a>, <a href="/gdpr">GDPR</a> și <a href="/cookie-policy">Cookies</a>.</p>
    </main>
  );
}
