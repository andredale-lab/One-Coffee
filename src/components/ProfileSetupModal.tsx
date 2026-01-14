import React, { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: 'IT' | 'EN';
}

export default function ProfileSetupModal({ isOpen, onClose, user, lang }: ProfileSetupModalProps) {
  const [interests, setInterests] = useState('');
  const [availabilityDays, setAvailabilityDays] = useState('');
  const [availabilityTime, setAvailabilityTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  if (!user) return null;

  const labels = {
    IT: {
      title: 'Completa il tuo profilo',
      description: 'Per trovarti il match perfetto, abbiamo bisogno di sapere cosa studi e cosa ti interessa.',
      interestsLabel: 'Di cosa ti occupi? / Interessi',
      daysLabel: 'Che giorni sei libero per un caffè?',
      timeLabel: 'A che ora sei libero per un caffè?',
      submit: 'Salva e continua',
      submitting: 'Salvataggio...'
    },
    EN: {
      title: 'Complete your profile',
      description: 'To find your perfect match, we need to know what you study and what you are interested in.',
      interestsLabel: 'Occupation / Interests',
      daysLabel: 'Which days are you free for a coffee?',
      timeLabel: 'What time are you free for a coffee?',
      submit: 'Save and continue',
      submitting: 'Saving...'
    }
  };

  const t = labels[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ controlla sessione 
      const { data: { session } } = 
        await supabase.auth.getSession(); 
 
      console.log('SESSION:', session); 
 
      if (!session) { 
        console.error('Sessione mancante'); 
        return; 
      } 
 
      // 2️⃣ user sicuro 
      const user = session.user; 
 
      // 3️⃣ update profilo 
      const { error } = await supabase 
        .from('profiles') 
        .update({ 
          interests,
          availability_days: availabilityDays,
          availability_time: availabilityTime
        }) 
        .eq('id', user.id); 
 
      console.log('UPDATE ERROR:', error);

      if (error) throw error;
      
      onClose();
      window.location.reload(); // Reload to reflect changes
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Errore nel salvataggio del profilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
          <p className="text-gray-600 mb-6">{t.description}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.interestsLabel}</label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder={lang === 'IT' ? "Es. Economia in Bocconi, startup, tennis..." : "Ex. Economics at Bocconi, startups, tennis..."}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.daysLabel}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                value={availabilityDays}
                onChange={e => setAvailabilityDays(e.target.value)}
                placeholder={lang === 'IT' ? "Es. Lunedì, Mercoledì..." : "Ex. Monday, Wednesday..."}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.timeLabel}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                value={availabilityTime}
                onChange={e => setAvailabilityTime(e.target.value)}
                placeholder={lang === 'IT' ? "Es. Pausa pranzo, dopo le 18..." : "Ex. Lunch break, after 6pm..."}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 text-white py-3 rounded-xl font-semibold hover:bg-amber-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.submitting : t.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
