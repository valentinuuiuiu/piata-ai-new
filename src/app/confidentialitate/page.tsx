export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1>Politica de confidențialitate</h1>

      <p>
        Piața AI ("noi", "Piata RO") respectă confidențialitatea utilizatorilor și
        tratează datele cu maximă atenție. Această pagină explică ce colectăm, de ce
        colectăm datele și cum le protejăm.
      </p>

      <h2>Ce date colectăm</h2>
      <ul>
        <li>Date de cont: nume, email, număr de telefon (dacă sunt furnizate).</li>
        <li>Date legate de anunțuri: titlu, descriere, imagini, preț, locație.</li>
        <li>Date tehnice: adrese IP, identificatori de sesiune și cookie-uri pentru a îmbunătăți experiența.</li>
        <li>Date de plată: referințe ce pot fi transmise procesatorului (ex. Stripe) – noi nu stocăm carduri.</li>
      </ul>

      <h2>De ce folosim datele</h2>
      <p>
        Scopurile principale sunt funcționarea platformei: publicarea și căutarea anunțurilor,
        procesarea plăților, moderare și siguranță, suport clienți și comunicări esențiale.
      </p>

      <h2>Cât timp le păstrăm</h2>
      <p>
        Păstrăm datele pe perioada necesară pentru scopurile pentru care au fost colectate,
        conform legii și politicilor interne. Utilizatorii pot solicita ștergerea sau restricționarea
        prelucrării contactând suportul.
      </p>

      <h2>Drepturile tale</h2>
      <ul>
        <li>Dreptul de acces la date</li>
        <li>Dreptul la rectificare</li>
        <li>Dreptul la ștergere ("dreptul de a fi uitat")</li>
        <li>Dreptul la portabilitate și opoziție</li>
      </ul>

      <h2>Securitate</h2>
      <p>
        Aplicăm bune practici de securitate: criptare la transport TLS, stocare cu acces restricționat,
        monitorizare și backup regulat. Noi nu stocăm date sensibile (de ex. numere de card) în codul sursă.
      </p>

      <h2>Contact</h2>
      <p>
        Pentru întrebări sau cereri GDPR, trimite un email prin pagina de <a href="/contact">Contact</a>
        sau la support@piata.ro (adresă de suport demonstrativă).
      </p>
    </main>
  );
}
