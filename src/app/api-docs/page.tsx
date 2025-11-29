export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1>Documentație API</h1>

      <p>
        Amenajăm treptat o documentație OpenAPI/Swagger completă. Mai jos sunt endpoint-urile publice de bază
        pentru a începe integrarea.
      </p>

      <h2>Health</h2>
      <pre><code>GET /api/health</code></pre>
      <p>Răspunde cu statusul serviciilor (db, redis)</p>

      <h2>Listings</h2>
      <ul>
        <li>GET /api/anunturi — listări</li>
        <li>GET /api/anunturi/{'id'} — detaliu anunț</li>
        <li>POST /api/anunturi — creare anunț (autentificare necesară)</li>
      </ul>

      <h2>Auth</h2>
      <ul>
        <li>POST /api/auth — login / sesiune</li>
        <li>GET /api/auth/session — verifică sesiunea curentă</li>
      </ul>

      <h2>Payments & Credits</h2>
      <ul>
        <li>POST /api/stripe/webhook — webhook plăți</li>
        <li>GET/POST /api/credits — gestiune credite</li>
      </ul>

      <h2>Next steps</h2>
      <p>
        Vom publica un fișier OpenAPI și integrare Swagger UI. Până atunci, folosește aceste endpoint-uri pentru prima etapă de integrare.
      </p>
    </main>
  );
}

