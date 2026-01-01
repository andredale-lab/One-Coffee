import { useState, useEffect } from 'react';
import {
  Coffee,
  Clock,
  Users,
  Zap,
  MapPin,
  Calendar,
  Shield,
  Lightbulb,
  ArrowRight,
  Mail,
  Linkedin,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import SignupModal from './SignupModal';
import UserProfile from './UserProfile';
import ProfileSetupModal from './ProfileSetupModal';
import ProfileView from './ProfileView';
import CommunityView from './CommunityView';
import MessagesView from './MessagesView';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function OneCoffeeIT() {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'community' | 'messages'>('home');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    if (!user) return;
    
    // 1. Get my conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    
    if (!conversations?.length) {
      setUnreadCount(0);
      return;
    }

    const convIds = conversations.map(c => c.id);

    // 2. Count unread messages
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .neq('sender_id', user.id)
      .eq('read', false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel('global_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchUnread();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    // Check if we need to open signup modal (e.g. after "Create new account" click)
    const shouldOpenSignup = localStorage.getItem('openSignupOnLoad');
    if (shouldOpenSignup === 'true') {
      setIsSignupOpen(true);
      localStorage.removeItem('openSignupOnLoad');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      




      if (currentUser && !currentUser.user_metadata?.interests) {
        setIsProfileSetupOpen(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      




      if (currentUser && !currentUser.user_metadata?.interests) {
        setIsProfileSetupOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const HomeContent = () => (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <Clock className="w-4 h-4 text-amber-700" />
                <span className="text-sm text-gray-700">20 minuti</span>
                <span className="text-gray-300">|</span>
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-700">networking</span>
                <span className="text-gray-300">|</span>
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-700">niente chat</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Un caffè, una <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600">connessione</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Esci dalla bolla universitaria. Conosci studenti, startupper e creativi intorno a un semplice caffè di 20 minuti.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <div className="bg-amber-100 text-amber-800 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 border border-amber-200 cursor-default">
                    <span>Benvenuto, {user.user_metadata?.full_name?.split(' ')[0] || 'Utente'}!</span>
                  </div>
                ) : (
                  <button onClick={() => setIsSignupOpen(true)} className="bg-amber-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-amber-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                    <span>Iscriviti</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                <a href="#come-funziona" className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center justify-center">
                  Scopri di più
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-orange-400/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-700">
                  <Coffee className="w-8 h-8 text-amber-700 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">20 minuti</p>
                    <p className="text-sm text-gray-600">Il tempo perfetto per conoscersi</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-600">
                  <Users className="w-8 h-8 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Persone reali</p>
                    <p className="text-sm text-gray-600">Studenti, creativi, startupper</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-600">
                  <Zap className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Subito in azione</p>
                    <p className="text-sm text-gray-600">Chat infinite? No grazie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Il Problema */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            La bolla universitaria è confortevole, ma limitante
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-red-50 rounded-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-lg text-gray-700 font-semibold mb-2">Conosci sempre le stesse persone</p>
              <p className="text-gray-600">Le stesse lezioni, gli stessi bar, le stesse facce</p>
            </div>

            <div className="p-8 bg-orange-50 rounded-2xl">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-lg text-gray-700 font-semibold mb-2">Le chat infinite annoiano</p>
              <p className="text-gray-600">Parliamo di veri network, non di scambi di messaggi</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-700 to-orange-600 text-white p-10 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-4">La soluzione</h3>
            <p className="text-xl leading-relaxed">
              20 minuti, una persona nuova, un caffè. Incontra studenti e giovani professionisti interessanti per una pausa caffè che vale davvero il tuo tempo. Offline, semplice e reale!
            </p>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section id="come-funziona" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            Come funziona?
          </h2>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-amber-700 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Crea profilo</h3>
                <p className="text-sm text-gray-600">Interessi, studio, lavoro</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Match istantaneo</h3>
                <p className="text-sm text-gray-600">Persone compatibili subito</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-yellow-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Caffè fissato</h3>
                <p className="text-sm text-gray-600">Luogo e orario confermati</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Conosci persone</h3>
                <p className="text-sm text-gray-600">20 minuti reali, faccia a faccia</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-amber-700">
            <p className="text-center text-gray-700"><span className="font-semibold text-amber-700">Non è dating.</span> Non è per trovare l'amore. È per scoprire persone interessanti, idee nuove, collaborazioni possibili.</p>
          </div>

          <div className="text-center mt-12">
            <a href="https://www.google.it/maps/search/milano+caff%C3%A8/@45.4669586,9.1801269,13z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D" target="_blank" rel="noopener noreferrer" className="bg-amber-700 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-amber-800 transition-all hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mx-auto">
              <span>Scopri i prossimi caffè</span>
              <Coffee className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Perché Funziona */}
      <section id="perche" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            Perché funziona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tempo perfetto</h3>
              <p className="text-gray-600">20 minuti bastano per capire se c'è click, senza annoiare</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Face to face</h3>
              <p className="text-gray-600">Niente chat, niente profili. Persone vere in una piazza vera</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Networking reale</h3>
              <p className="text-gray-600">Scopri persone nuove, crea collaborazioni, amplia la tua rete</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sicuro e verificato</h3>
              <p className="text-gray-600">Profili reali, niente bot, niente cattivi attori</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flessibile</h3>
              <p className="text-gray-600">Prenota tra una lezione e l'altra, sempre da Milano</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gratuito</h3>
              <p className="text-gray-600">Sei tu a pagare il caffè, niente di più</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            Domande frequenti
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Come viene scelta la persona?</h3>
              <p className="text-gray-600">Algoritmi intelligenti basati su interessi comuni, studi, lavoro. Niente random.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mi conviene davvero?</h3>
              <p className="text-gray-600">Se studi a Milano, vuoi conoscere persone nuove, e credi nel networking: sì, moltissimo.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">È davvero solo 20 minuti?</h3>
              <p className="text-gray-600">Sì, ma se cliccate potete stare più a lungo. Il punto è che nessuno è obbligato.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dove prenotiamo il caffè?</h3>
              <p className="text-gray-600">Suggerimenti di locali a Milano, ma siete liberi di scegliere quello che preferite.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-700 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-6xl font-bold">
            Pronto per un caffè interessante?
          </h2>

          {user ? (
            <div className="bg-white/10 text-white px-12 py-5 rounded-full font-bold text-xl inline-block border border-white/20 cursor-default">
              Sei già dei nostri!
            </div>
          ) : (
            <button onClick={() => setIsSignupOpen(true)} className="bg-white text-amber-700 px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl inline-block">
              Iscriviti
            </button>
          )}

          <p className="text-amber-100 text-lg">Iscriviti e allarga il tuo network</p>
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('home')}>
              <Coffee className="w-8 h-8 text-amber-700" />
              <span className="text-xl font-bold text-gray-900">One-Coffee</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {user ? (
                <>
                  <button 
                    onClick={() => setCurrentView('home')}
                    className={`font-medium transition-colors ${currentView === 'home' ? 'text-amber-700' : 'text-gray-600 hover:text-amber-700'}`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => setCurrentView('community')}
                    className={`font-medium transition-colors ${currentView === 'community' ? 'text-amber-700' : 'text-gray-600 hover:text-amber-700'}`}
                  >
                    Community
                  </button>
                  <button 
                    onClick={() => setCurrentView('messages')}
                    className={`font-medium transition-colors relative ${currentView === 'messages' ? 'text-amber-700' : 'text-gray-600 hover:text-amber-700'}`}
                  >
                    Messaggi
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setCurrentView('profile')}
                    className={`font-medium transition-colors ${currentView === 'profile' ? 'text-amber-700' : 'text-gray-600 hover:text-amber-700'}`}
                  >
                    Profilo
                  </button>
                </>
              ) : (
                <>
                  <a href="#come-funziona" className="text-gray-600 hover:text-amber-700 transition-colors">Come funziona</a>
                  <a href="#perche" className="text-gray-600 hover:text-amber-700 transition-colors">Perché</a>
                  <a href="#faq" className="text-gray-600 hover:text-amber-700 transition-colors">FAQ</a>
                </>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setIsContactsOpen(!isContactsOpen)}
                  onBlur={() => setTimeout(() => setIsContactsOpen(false), 200)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-amber-700 transition-colors focus:outline-none"
                >
                  <span>Contatti</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isContactsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isContactsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <a 
                      href="mailto:contact@one-coffee.it" 
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>contact@one-coffee.it</span>
                    </a>
                    <a 
                      href="https://www.linkedin.com/company/one-coffee/?viewAsMember=true" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                )}
              </div>

              {user ? (
                <UserProfile user={user} lang="IT" />
              ) : (
                <button onClick={() => setIsSignupOpen(true)} className="bg-amber-700 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-800 transition-all hover:scale-105 inline-block">
                  Iscriviti
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <button 
                    onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }}
                    className={`text-left font-medium py-2 ${currentView === 'home' ? 'text-amber-700' : 'text-gray-600'}`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { setCurrentView('community'); setIsMobileMenuOpen(false); }}
                    className={`text-left font-medium py-2 ${currentView === 'community' ? 'text-amber-700' : 'text-gray-600'}`}
                  >
                    Community
                  </button>
                  <button 
                    onClick={() => { setCurrentView('messages'); setIsMobileMenuOpen(false); }}
                    className={`text-left font-medium py-2 flex items-center justify-between ${currentView === 'messages' ? 'text-amber-700' : 'text-gray-600'}`}
                  >
                    <span>Messaggi</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }}
                    className={`text-left font-medium py-2 ${currentView === 'profile' ? 'text-amber-700' : 'text-gray-600'}`}
                  >
                    Profilo
                  </button>
                  <div className="py-2 border-t border-gray-100 mt-2 pt-4">
                    <UserProfile user={user} lang="IT" />
                  </div>
                </>
              ) : (
                <>
                  <a href="#come-funziona" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 py-2">Come funziona</a>
                  <a href="#perche" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 py-2">Perché</a>
                  <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 py-2">FAQ</a>
                  <button onClick={() => { setIsSignupOpen(true); setIsMobileMenuOpen(false); }} className="bg-amber-700 text-white px-6 py-2 rounded-full font-medium mt-2 w-full">
                    Iscriviti
                  </button>
                </>
              )}
              
              <div className="border-t border-gray-100 pt-4 mt-2">
                 <p className="text-sm text-gray-400 mb-2">Contatti</p>
                 <a href="mailto:contact@one-coffee.it" className="flex items-center space-x-2 text-gray-600 py-2">
                    <Mail className="w-4 h-4" />
                    <span>contact@one-coffee.it</span>
                 </a>
                 <a href="https://www.linkedin.com/company/one-coffee/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-600 py-2">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                 </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      {currentView === 'home' && <HomeContent />}
      {currentView === 'profile' && user && <ProfileView user={user} lang="IT" />}
      {currentView === 'community' && user && <CommunityView user={user} lang="IT" />}
      {currentView === 'messages' && user && <MessagesView user={user} lang="IT" onMessagesRead={fetchUnread} />}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coffee className="w-8 h-8 text-amber-500" />
                <span className="text-xl font-bold text-white">One-Coffee</span>
              </div>
              <p className="text-sm text-gray-400">
                20 minuti, una persona nuova. Networking come dovrebbe essere.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Link</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#come-funziona" className="hover:text-amber-500 transition-colors">Come funziona</a></li>
                <li><a href="#perche" className="hover:text-amber-500 transition-colors">Perché</a></li>
                <li><a href="#faq" className="hover:text-amber-500 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Social</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.linkedin.com/company/one-coffee/?viewAsMember=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-500 transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@one-coffee.it"
                    className="hover:text-amber-500 transition-colors"
                  >
                    contact@one-coffee.it
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.iubenda.com/privacy-policy/98586684"
                    className="iubenda-white iubenda-noiframe iubenda-embed hover:text-amber-500 transition-colors"
                    title="Privacy Policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 One-Coffee. Creato da studenti per tutti.</p>
          </div>
        </div>
      </footer>
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={() => {
          setIsSignupOpen(false);
          localStorage.removeItem('openSignupOnLoad');
        }} 
        lang="IT" 
      />
      {user && (
        <ProfileSetupModal
          isOpen={isProfileSetupOpen}
          onClose={() => setIsProfileSetupOpen(false)}
          user={user}
          lang="IT"
        />
      )}
    </div>
  );
}
