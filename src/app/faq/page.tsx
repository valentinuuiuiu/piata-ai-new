export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1>Întrebări frecvente (FAQ)</h1>

      <section>
        <h2>Cum creez un anunț?</h2>
        <p>
          Autentifică-te și accesează <a href="/postare">Postează Anunț</a>. Completează titlul,
          descrierea, alege categoria și încarcă imagini. Poți selecta opțiuni premium pentru
          vizibilitate sporită.
        </p>
      </section>

      <section>
        <h2>Cum cumpăr credite?</h2>
        <p>Vizitează pagina <a href="/credits">Cumpără Credite</a> și alege un pachet. Plățile sunt procesate prin Stripe.</p>
      </section>

      <section>
        <h2>Ce fac dacă văd un anunț suspect?</h2>
        <p>Folosește butonul "Report" de pe anunț sau contactează <a href="/contact">echipa de suport</a> cu detaliile.</p>
      </section>

      <section>
        <h2>Cum pot șterge contul meu?</h2>
        <p>Trimite o cerere prin <a href="/contact">Contact</a> sau folosește setările contului pentru a solicita ștergerea datelor.</p>
      </section>

      <section>
        <h2>API pentru dezvoltatori</h2>
        <p>Consultați secțiunea <a href="/api-docs">API</a> pentru endpoint-urile de bază și integrare.</p>
      </section>

      <p className="text-sm text-gray-400">Dacă nu găsești răspunsul, trimite o întrebare la <a href="/support">Suport</a> sau <a href="/contact">Contact</a>.</p>
    </main>
  );
}
