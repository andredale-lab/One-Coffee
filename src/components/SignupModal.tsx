import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'IT' | 'EN';
}

export default function SignupModal({ isOpen, onClose, lang }: SignupModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    interests: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const labels = {
    IT: {
      title: 'Crea il tuo account',
      name: 'Nome Completo',
      email: 'Email',
      password: 'Password',
      interests: 'Di cosa ti occupi? / Interessi',
      submit: 'Registrati',
      submitting: 'Registrazione...',
      success: 'Controlla la tua email per confermare!',
      error: 'Errore durante la registrazione.',
      close: 'Chiudi',
      continueWithGoogle: 'Continua con Google',
      or: 'oppure'
    },
    EN: {
      title: 'Create your account',
      name: 'Full Name',
      email: 'Email',
      password: 'Password',
      interests: 'Occupation / Interests',
      submit: 'Sign Up',
      submitting: 'Signing up...',
      success: 'Check your email to confirm!',
      error: 'Error during registration.',
      close: 'Close',
      continueWithGoogle: 'Continue with Google',
      or: 'or'
    }
  };

  const t = labels[lang];

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error logging in with Google:', error);
      alert(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            interests: formData.interests,
          }
        }
      });

      if (error) throw error;

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({ full_name: '', email: '', password: '', interests: '' });
      }, 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('error');
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.title}</h2>
          
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-xl font-semibold mb-2">✓ {t.success}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t.continueWithGoogle}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">{t.or}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.interests}</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    value={formData.interests}
                    onChange={e => setFormData({...formData, interests: e.target.value})}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMessage || t.error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 text-white py-3 rounded-xl font-semibold hover:bg-amber-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.submitting : t.submit}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
