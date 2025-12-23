import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

interface CookieConsentProps {
  language: 'it' | 'en';
}

export default function CookieConsent({ language }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const content = {
    it: {
      title: 'Privacy e Cookie',
      text: 'Utilizziamo i cookie per migliorare la tua esperienza. Cliccando su "Accetta tutti", acconsenti alla raccolta della tua email e dei dati personali inseriti per le finalità del servizio, nel rispetto della nostra Privacy Policy.',
      accept: 'Accetta tutti',
      reject: 'Rifiuta tutti'
    },
    en: {
      title: 'Privacy & Cookies',
      text: 'We use cookies to improve your experience. By clicking "Accept all", you consent to the collection of your email and personal data entered for service purposes, in accordance with our Privacy Policy.',
      accept: 'Accept all',
      reject: 'Reject all'
    }
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 transform transition-all animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Cookie className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t.title}</h3>
          </div>
        </div>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {t.text}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition-colors shadow-lg shadow-amber-700/20"
          >
            {t.accept}
          </button>
          <button
            onClick={handleReject}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            {t.reject}
          </button>
        </div>
      </div>
    </div>
  );
}
