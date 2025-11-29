export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1>Ghid rapid de utilizare</h1>

      <h2>1. Creare cont</h2>
      <p>Apasă "Înregistrare" și urmează pașii (email, parolă, confirmare). Poți folosi OAuth dacă este disponibil.</p>

      <h2>2. Postează un anunț</h2>
      <ol>
        <li>Click pe <a href="/postare">Postează Anunț</a>.</li>
        <li>Completează titlul, descrierea, prețul și categorii.</li>
        <li>Încarcă până la 5 imagini (formate suportate: jpg, png).</li>
        <li>Publică — anunțul poate intra în moderare înainte de publicare live.</li>
      </ol>

      <h2>3. Manage cont & plăți</h2>
      <p>Accesează <a href="/dashboard">Dashboard</a> pentru a gestiona anunțurile, cumpăra credite și vizualiza plățile.</p>

      <h2>4. Siguranță</h2>
      <ul>
        <li>Nu furniza date sensibile în anunț.</li>
        <li>Folosește întâlniri în locuri publice pentru tranzacții.</li>
        <li>Raportează comportamentul suspect echipei noastre.</li>
      </ul>

      <p className="text-sm text-gray-400">Pentru instrucțiuni detaliate, consultă <a href="/help">Centrul de Ajutor</a> sau documentația pentru dezvoltatori.</p>
    </main>
  );
}
