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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.user_metadata?.avatar_url || null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setAvatarUrl(data.avatar_url || null);
        }
      });
  }, [user.id]);

  const t = {
    IT: {
      logout: 'Esci',
      signedInAs: 'Accesso effettuato come'
    },
    EN: {
      logout: 'Sign out',
      signedInAs: 'Signed in as'
    }
  }[lang];

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

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

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
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
