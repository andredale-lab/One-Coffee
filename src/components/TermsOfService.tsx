import { ArrowLeft } from 'lucide-react';

// Componente Termini di Servizio
interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termini di Servizio</h1>
        
        <div className="prose prose-amber max-w-none text-gray-600 space-y-6">
          <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Accettazione dei termini</h2>
            <p>
              Utilizzando One-Coffee, accetti questi termini di servizio. Se non sei d'accordo, ti preghiamo di non utilizzare l'app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Scopo del servizio</h2>
            <p>
              One-Coffee è una piattaforma per facilitare incontri professionali e di networking tra studenti e giovani professionisti. Non è un'app di dating.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Codice di condotta</h2>
            <p>
              Ci aspettiamo che tutti gli utenti si comportino in modo rispettoso e professionale. Comportamenti molesti, offensivi o inappropriati porteranno alla sospensione immediata dell'account.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Sii puntuale agli incontri</li>
              <li>Rispetta l'altra persona</li>
              <li>Se non puoi presentarti, avvisa con anticipo o cancella l'incontro</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Responsabilità</h2>
            <p>
              One-Coffee non è responsabile per le azioni degli utenti offline. Incoraggiamo sempre a incontrarsi in luoghi pubblici e sicuri (come i bar suggeriti).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Modifiche ai termini</h2>
            <p>
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno comunicate tramite l'app o via email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}