import { ArrowLeft } from 'lucide-react';

// Componente Privacy Policy
interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-white pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center text-amber-700 hover:text-amber-800 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Torna indietro
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Informativa sulla Privacy</h1>
        
        <div className="prose prose-amber max-w-none text-gray-600 space-y-6">
          <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Raccolta dei dati</h2>
            <p>
              Raccogliamo solo i dati necessari per il funzionamento del servizio: nome, email, interessi, studi/lavoro e preferenze di zona per i caffè.
              Questi dati servono esclusivamente per creare i match e organizzare gli incontri.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Utilizzo dei dati</h2>
            <p>
              I tuoi dati vengono utilizzati per:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Creare il tuo profilo utente</li>
              <li>Trovare persone compatibili con i tuoi interessi (matching)</li>
              <li>Organizzare gli incontri (luogo e ora)</li>
              <li>Comunicazioni di servizio essenziali</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Condivisione dei dati</h2>
            <p>
              Non vendiamo i tuoi dati a terzi. I tuoi dati vengono condivisi solo con l'utente con cui hai un match confermato, limitatamente a quanto necessario per l'incontro (nome, interessi, foto profilo).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sicurezza</h2>
            <p>
              Adottiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati da accessi non autorizzati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. I tuoi diritti</h2>
            <p>
              Hai il diritto di accedere, rettificare o cancellare i tuoi dati in qualsiasi momento. Puoi farlo direttamente dalle impostazioni del profilo o contattandoci a contact@one-coffee.it.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}