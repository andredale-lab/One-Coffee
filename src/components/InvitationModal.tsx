import React, { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { X, Send } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  interests: string;
  avatar_url?: string | null;
  email?: string;
}

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiver: Profile | null;
  sender: User;
  lang: 'IT' | 'EN';
}

export default function InvitationModal({ isOpen, onClose, receiver, sender, lang }: InvitationModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !receiver) return null;

  const t = {
    IT: {
      title: 'Invita per un caffè',
      placeholder: 'Scrivi un messaggio per invitare...',
      send: 'Invia invito',
      sending: 'Invio in corso...',
      success: 'Invito inviato con successo!',
      error: 'Errore durante l\'invio dell\'invito',
      cancel: 'Annulla'
    },
    EN: {
      title: 'Invite for a coffee',
      placeholder: 'Write a message to invite...',
      send: 'Send invite',
      sending: 'Sending...',
      success: 'Invite sent successfully!',
      error: 'Error sending invite',
      cancel: 'Cancel'
    }
  }[lang];

  const selectedUser = receiver;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('Sessione mancante');
      alert('Devi essere loggato per inviare un invito');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('invitations')
      .insert({
        sender_id: session.user.id,
        receiver_id: selectedUser.id,
        message
      });

    console.log('INVITE ERROR:', error);

    if (error) {
      alert('Errore durante l’invio dell’invito');
    } else {
      alert('Invito inviato!');
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="mb-6 flex items-center p-4 bg-amber-50 rounded-xl">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-200 mr-4 flex-shrink-0">
              {receiver.avatar_url ? (
                <img src={receiver.avatar_url} alt={receiver.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-amber-100" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{receiver.full_name}</p>
              <p className="text-sm text-gray-500 truncate max-w-[200px]">{receiver.interests}</p>
            </div>
          </div>
          
          {success ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center space-x-2">
              <Send className="w-5 h-5" />
              <span>{t.success}</span>
            </div>
          ) : (
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t.placeholder}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="flex-1 bg-amber-700 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>{t.sending}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.send}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
