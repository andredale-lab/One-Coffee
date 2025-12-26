import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Search, Mail, MapPin, Coffee, User as UserIcon } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  interests: string;
  avatar_url: string | null;
  email: string;
}

interface CommunityViewProps {
  user: User;
  lang: 'IT' | 'EN';
}

export default function CommunityView({ user, lang }: CommunityViewProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id) // Don't show current user
        .limit(50);

      if (error) {
        // If table doesn't exist, we might get an error.
        console.error('Error fetching profiles:', error);
        return;
      }

      if (data) {
        setProfiles(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.interests?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const t = {
    IT: {
      title: 'Community',
      subtitle: 'Scopri persone interessanti intorno a te',
      search: 'Cerca per nome o interessi...',
      invite: 'Invita per un caffè',
      noResults: 'Nessun utente trovato.',
      emptyState: 'La community sta crescendo! Torna presto per vedere nuovi profili.'
    },
    EN: {
      title: 'Community',
      subtitle: 'Discover interesting people around you',
      search: 'Search by name or interests...',
      invite: 'Invite for a coffee',
      noResults: 'No users found.',
      emptyState: 'The community is growing! Check back soon for new profiles.'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm shadow-sm transition-shadow hover:shadow-md"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-64 shadow-sm"></div>
            ))}
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-100 group-hover:border-amber-300 transition-colors">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-300">
                              <UserIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{profile.full_name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>Milano</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Interessi:</p>
                    <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg min-h-[5rem]">
                      {profile.interests || "Nessun interesse specificato"}
                    </p>
                  </div>

                  <a
                    href={`mailto:${profile.email}?subject=Caffè su One-Coffee?&body=Ciao ${profile.full_name.split(' ')[0]}, ti ho visto su One-Coffee e mi piacerebbe offrirti un caffè per parlare di...`}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-50 text-amber-800 py-3 rounded-xl font-semibold hover:bg-amber-700 hover:text-white transition-all group-hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>{t.invite}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{profiles.length === 0 ? t.emptyState : t.noResults}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
