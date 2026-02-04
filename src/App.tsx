import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import OneCoffeeIT from './components/OneCoffeeIT';
import OneCoffeeEN from './components/OneCoffeeEN';
import CookieConsent from './components/CookieConsent';
import { Globe } from 'lucide-react';

function App() {
  const [language, setLanguage] = useState<'it' | 'en'>('it');
  const isWeb = !Capacitor.isNativePlatform();

  return (
    <div>
      {isWeb && <CookieConsent language={language} />}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
          className="bg-amber-700 text-white px-4 py-3 rounded-full font-semibold hover:bg-amber-800 transition-all hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <Globe className="w-5 h-5" />
          <span>{language === 'it' ? 'EN' : 'IT'}</span>
        </button>
      </div>
      {language === 'it' ? <OneCoffeeIT /> : <OneCoffeeEN />}
    </div>
  );
}

export default App;
