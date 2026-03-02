import { useState } from 'react';
import { X, MapPin, Coffee, User as UserIcon } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  interests: string;
  avatar_url?: string | null;
  preferred_zone?: string;
  availability_days?: string;
  availability_time?: string;
}

interface ProfileModalProps {
  profile: Profile;
  lang: 'IT' | 'EN';
  onClose: () => void;
  onInvite?: (p: Profile) => void;
}

export default function ProfileModal({ profile, lang, onClose, onInvite }: ProfileModalProps) {
  const [showImagePreview, setShowImagePreview] = useState(false);

  const t = {
    IT: {
      title: 'Profilo',
      zone: 'Zona preferita',
      interests: 'Interessi',
      days: 'Giorni disponibili',
      times: 'Orari disponibili',
      invite: 'Invita per un caffè',
      close: 'Chiudi',
      noInterests: 'Nessun interesse specificato',
      noDays: 'Non specificato',
      noTimes: 'Non specificato'
    },
    EN: {
      title: 'Profile',
      zone: 'Preferred zone',
      interests: 'Interests',
      days: 'Available days',
      times: 'Available times',
      invite: 'Invite for a coffee',
      close: 'Close',
      noInterests: 'No interests specified',
      noDays: 'Not specified',
      noTimes: 'Not specified'
    }
  }[lang];

  const formatList = (val: any) => {
    if (!val) return '-';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowImagePreview(true)}
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-200 flex-shrink-0 hover:opacity-90 transition"
                aria-label="Open avatar"
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-300">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}
              </button>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 truncate">{profile.full_name}</p>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1 text-amber-600" />
                  <span className="truncate">{profile.preferred_zone || 'Milano'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">{t.interests}</p>
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {profile.interests || t.noInterests}
                </div>
              </div>

              {(profile.availability_days || profile.availability_time) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-amber-800 mb-1">{t.days}</p>
                    <p className="text-sm text-amber-900">{formatList(profile.availability_days) || t.noDays}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-amber-800 mb-1">{t.times}</p>
                    <p className="text-sm text-amber-900">{formatList(profile.availability_time) || t.noTimes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onInvite?.(profile)}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-amber-700 transition"
              >
                <Coffee className="w-5 h-5" />
                <span>{t.invite}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImagePreview && profile.avatar_url && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Close image"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>
      )}
    </>
  );
}

