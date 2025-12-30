import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Mail, Check, X, Clock } from 'lucide-react';

interface MessagesViewProps {
  user: User;
  lang: 'IT' | 'EN';
}

interface Invitation {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

export default function MessagesView({ user, lang }: MessagesViewProps) {
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    const loadInvitations = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('receiver_id', session.user.id);

      console.log('INVITI:', data, error);
      if (!error) setInvitations(data ?? []);
    };

    loadInvitations();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setInvitations(prev => 
        prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv)
      );
    } catch (error) {
      console.error('Error updating invitation:', error);
    }
  };

  const t = {
    IT: {
      title: 'Messaggi',
      subtitle: 'I tuoi inviti per un caffè',
      noMessages: 'Non hai ancora ricevuto messaggi.',
      from: 'Da:',
      message: 'Messaggio:',
      accept: 'Accetta',
      reject: 'Rifiuta',
      accepted: 'Accettato',
      rejected: 'Rifiutato',
      pending: 'In attesa'
    },
    EN: {
      title: 'Messages',
      subtitle: 'Your coffee invitations',
      noMessages: 'You have not received any messages yet.',
      from: 'From:',
      message: 'Message:',
      accept: 'Accept',
      reject: 'Reject',
      accepted: 'Accepted',
      rejected: 'Rejected',
      pending: 'Pending'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>

        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-100 flex-shrink-0">
                      {invitation.sender?.avatar_url ? (
                        <img src={invitation.sender.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-300">
                          <Mail className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{invitation.sender?.full_name || 'Utente sconosciuto'}</h3>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${invitation.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                          invitation.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {t[invitation.status]}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm">
                      {invitation.message}
                    </div>

                    {invitation.status === 'pending' && (
                      <div className="flex space-x-3 pt-2">
                        <button
                          onClick={() => handleStatusUpdate(invitation.id, 'accepted')}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.accept}</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(invitation.id, 'rejected')}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                        >
                          <X className="w-4 h-4" />
                          <span>{t.reject}</span>
                        </button>
                      </div>
                    )}
                    
                    {invitation.status === 'accepted' && (
                      <div className="text-sm text-green-700 mt-2">
                        Hai accettato questo invito! Contatta {invitation.sender?.full_name} via email: <a href={`mailto:${invitation.sender?.email}`} className="underline font-semibold">{invitation.sender?.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t.noMessages}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
