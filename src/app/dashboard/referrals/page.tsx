import ReferralDashboard from '@/components/Referral/ReferralDashboard';

export const metadata = {
  title: 'Program Recomandare | Piata AI RO',
  description: 'Invită-ți prietenii și câștigă credit pentru anunțurile tale.',
};

export default function ReferralsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent mb-4">
          Programul de Recomandare
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Ajută comunitatea Piata AI RO să crească și primește recompense pentru fiecare utilizator nou adus pe platformă.
        </p>
      </div>

      <ReferralDashboard />
      
      <div className="mt-16 glass p-8 rounded-3xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Cum funcționează?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#00f0ff]/10 rounded-2xl flex items-center justify-center text-[#00f0ff] font-black text-xl">1</div>
            <h3 className="text-xl font-bold text-white">Trimite Codul</h3>
            <p className="text-gray-400 text-sm">Distribuie codul tău unic pe WhatsApp, Facebook sau SMS prietenilor tăi.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#ff00f0]/10 rounded-2xl flex items-center justify-center text-[#ff00f0] font-black text-xl">2</div>
            <h3 className="text-xl font-bold text-white">Ei se Înscriu</h3>
            <p className="text-gray-400 text-sm">Prietenii tăi primesc instant 50 RON credit cadou la crearea contului folosind codul tău.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 font-black text-xl">3</div>
            <h3 className="text-xl font-bold text-white">Tu Câștigi</h3>
            <p className="text-gray-400 text-sm">Primești 25 RON credit pentru fiecare prieten care își confirmă contul. Plus bonusuri pentru invitații lor!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
