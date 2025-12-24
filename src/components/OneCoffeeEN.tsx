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
  ChevronDown
} from 'lucide-react';
import SignupModal from './SignupModal';
import UserProfile from './UserProfile';
import ProfileSetupModal from './ProfileSetupModal';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function OneCoffeeEN() {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Coffee className="w-8 h-8 text-amber-700" />
              <span className="text-xl font-bold text-gray-900">One-Coffee</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-amber-700 transition-colors">How it works</a>
              
              <div className="relative">
                <button 
                  onClick={() => setIsContactsOpen(!isContactsOpen)}
                  onBlur={() => setTimeout(() => setIsContactsOpen(false), 200)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-amber-700 transition-colors focus:outline-none"
                >
                  <span>Contacts</span>
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

              <a href="#why" className="text-gray-600 hover:text-amber-700 transition-colors">Why</a>
              <a href="#faq" className="text-gray-600 hover:text-amber-700 transition-colors">FAQ</a>
              {user ? (
                <UserProfile user={user} lang="EN" />
              ) : (
                <button onClick={() => setIsSignupOpen(true)} className="bg-amber-700 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-800 transition-all hover:scale-105 inline-block">
                  Sign up
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <Clock className="w-4 h-4 text-amber-700" />
                <span className="text-sm text-gray-700">20 minutes</span>
                <span className="text-gray-300">|</span>
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-700">networking</span>
                <span className="text-gray-300">|</span>
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-700">no chats</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                One coffee, one <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600">connection</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Break out of your university bubble. Meet students, founders, and creatives over a simple 20-minute coffee.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <div className="bg-amber-100 text-amber-800 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 border border-amber-200 cursor-default">
                    <span>Welcome, {user.user_metadata?.full_name?.split(' ')[0] || 'User'}!</span>
                  </div>
                ) : (
                  <button onClick={() => setIsSignupOpen(true)} className="bg-amber-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-amber-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                    <span>Sign up</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                <a href="#how-it-works" className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center justify-center">
                  Learn more
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-orange-400/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-700">
                  <Coffee className="w-8 h-8 text-amber-700 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">20 minutes</p>
                    <p className="text-sm text-gray-600">The perfect time to connect</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-600">
                  <Users className="w-8 h-8 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Real people</p>
                    <p className="text-sm text-gray-600">Students, creatives, founders</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-600">
                  <Zap className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Action first</p>
                    <p className="text-sm text-gray-600">No endless chats. Meet face-to-face</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            The university bubble is comfy, but limiting
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-red-50 rounded-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-lg text-gray-700 font-semibold mb-2">Same people, same places</p>
              <p className="text-gray-600">Same lectures, same bars, same faces</p>
            </div>

            <div className="p-8 bg-orange-50 rounded-2xl">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-lg text-gray-700 font-semibold mb-2">Infinite chats are boring</p>
              <p className="text-gray-600">We're talking real networking, not endless messages</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-700 to-orange-600 text-white p-10 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-4">The solution</h3>
            <p className="text-xl leading-relaxed">
              20 minutes, one new person, one coffee. Meet interesting students and young professionals for a coffee break that's truly worth your time. Offline, simple, and real!
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            How it works
          </h2>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-amber-700 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Create profile</h3>
                <p className="text-sm text-gray-600">Interests, studies, work</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Instant match</h3>
                <p className="text-sm text-gray-600">Compatible people right away</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-yellow-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Coffee booked</h3>
                <p className="text-sm text-gray-600">Location and time confirmed</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Meet someone</h3>
                <p className="text-sm text-gray-600">20 real minutes, face to face</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-amber-700">
            <p className="text-center text-gray-700"><span className="font-semibold text-amber-700">It's not dating.</span> It's not about romance. It's about meeting interesting people, finding new ideas, discovering possible collaborations.</p>
          </div>

          <div className="text-center mt-12">
            <button className="bg-amber-700 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-amber-800 transition-all hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mx-auto">
              <span>See upcoming coffees</span>
              <Coffee className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section id="why" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            Why it works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Perfect timing</h3>
              <p className="text-gray-600">20 minutes is enough to spark something, without overstaying</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Face to face</h3>
              <p className="text-gray-600">No chats, no profiles. Real people in a real place</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real networking</h3>
              <p className="text-gray-600">Meet new people, create collaborations, expand your network</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safe and verified</h3>
              <p className="text-gray-600">Real profiles, no bots, no bad actors</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible</h3>
              <p className="text-gray-600">Book between classes, whenever you want, always in Milan</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free</h3>
              <p className="text-gray-600">You pay for your coffee, that's it</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            Frequently asked
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How do you choose the person?</h3>
              <p className="text-gray-600">Smart algorithms based on common interests, studies, work. Nothing random.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is it really worth it?</h3>
              <p className="text-gray-600">If you study in Milan, want to meet new people, and believe in networking: absolutely yes.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Only 20 minutes really?</h3>
              <p className="text-gray-600">Yes, but if you click you can stay longer. The point is no one is forced.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Where do we book the coffee?</h3>
              <p className="text-gray-600">Suggestions of places in Milan, but you're free to choose what you prefer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-700 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-6xl font-bold">
            Ready for an interesting coffee?
          </h2>

          {user ? (
            <div className="bg-white/10 text-white px-12 py-5 rounded-full font-bold text-xl inline-block border border-white/20 cursor-default">
              You're already in!
            </div>
          ) : (
            <button onClick={() => setIsSignupOpen(true)} className="bg-white text-amber-700 px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl inline-block">
              Sign up
            </button>
          )}

          <p className="text-amber-100 text-lg">Limited spots. Milan only for now.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coffee className="w-8 h-8 text-amber-500" />
                <span className="text-xl font-bold text-white">One-Coffee</span>
              </div>
              <p className="text-sm text-gray-400">
                20 minutes, one new person. Networking as it should be.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-amber-500 transition-colors">How it works</a></li>
                <li><a href="#why" className="hover:text-amber-500 transition-colors">Why</a></li>
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
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 One-Coffe. Created by economists for economists.</p>
          </div>
        </div>
      </footer>
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)} 
        lang="EN" 
      />
      {user && (
        <ProfileSetupModal
          isOpen={isProfileSetupOpen}
          onClose={() => setIsProfileSetupOpen(false)}
          user={user}
          lang="EN"
        />
      )}
    </div>
  );
}
