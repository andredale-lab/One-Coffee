import { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfileProps {
  user: User;
  lang: 'IT' | 'EN';
}

export default function UserProfile({ user, lang }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleNewAccount = async () => {
    // Current session is already saved by OneCoffeeIT
    // Use scope: 'local' to keep the session valid on server so we can switch back later
    await supabase.auth.signOut({ scope: 'local' });
    localStorage.setItem('openSignupOnLoad', 'true');
    window.location.reload();
  };

  const handleSwitchAccount = async (session: any) => {
    // First sign out locally to clear current session without revoking it
    await supabase.auth.signOut({ scope: 'local' });
    
    // Then set the new session using tokens
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (error) {
        console.error("Error switching account:", error);
        alert("Sessione scaduta, per favore effettua di nuovo l'accesso.");
        // If error, reload will show signed out state
        window.location.reload();
    } else {
        window.location.reload();
    }
  };

  const t = {
    IT: {
      logout: 'Esci',
      newAccount: 'Crea nuovo account',
      signedInAs: 'Accesso effettuato come'
    },
    EN: {
      logout: 'Sign out',
      newAccount: 'Create new account',
      signedInAs: 'Signed in as'
    }
  }[lang];

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  // Get other saved sessions
  const storedSessions = JSON.parse(localStorage.getItem('one_coffee_sessions') || '{}');
  const otherAccounts = Object.values(storedSessions).filter((s: any) => s.user.id !== user.id);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full transition-all focus:outline-none border border-gray-200"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
            <UserIcon className="w-4 h-4" />
          </div>
        )}
        <span className="font-medium max-w-[100px] truncate hidden sm:inline-block">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500">{t.signedInAs}</p>
            <p className="text-sm font-semibold text-gray-900 truncate" title={user.email}>{user.email}</p>
          </div>
          
          {/* Other Accounts List */}
          {otherAccounts.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <p className="px-4 text-xs text-gray-500 mb-1">{t.switchAccount}</p>
              {otherAccounts.map((account: any) => (
                <button
                  key={account.user.id}
                  onClick={() => handleSwitchAccount(account.session)}
                  className="w-full text-left flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-100 flex-shrink-0">
                    {account.user.user_metadata?.avatar_url ? (
                      <img src={account.user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-700 text-xs">
                        <UserIcon className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 truncate">{account.user.user_metadata?.full_name || account.user.email}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleNewAccount}
            className="w-full text-left flex items-center space-x-3 px-4 py-3 hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span>{t.newAccount}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-gray-700 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      )}
    </div>
  );
}
