import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Search, MapPin, Coffee, User as UserIcon, Plus, X, CalendarDays, Clock, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import InvitationModal from './InvitationModal';
import MapPicker from './MapPicker';

interface Profile {
  id: string;
  full_name: string;
  interests: string;
  avatar_url?: string | null;
  email?: string;
  preferred_zone?: string;
  availability_days?: string;
  availability_time?: string;
}

interface CoffeeTable {
  id: string;
  host_id: string;
  title: string;
  bar_name: string;
  coffee_date: string;
  coffee_time: string;
  profiles?: {
    full_name: string;
    avatar_url?: string | null;
  };
}

interface CommunityViewProps {
  user: User;
  lang: 'IT' | 'EN';
  onBack?: () => void;
}

export default function CommunityView({ user, lang, onBack }: CommunityViewProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showCreateCoffeeModal, setShowCreateCoffeeModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [myTable, setMyTable] = useState<{id?: string, bar: string, title: string, date: string, time: string} | null>(null);
  const [tables, setTables] = useState<CoffeeTable[]>([]);
  const [viewMode, setViewMode] = useState<'profiles' | 'tables'>('profiles');
  const [coffeeBar, setCoffeeBar] = useState('');
  const [coffeeTitle, setCoffeeTitle] = useState('');
  const [coffeeDate, setCoffeeDate] = useState('');
  const [coffeeTime, setCoffeeTime] = useState('');
  const [joiningTableId, setJoiningTableId] = useState<string | null>(null);

  const formatList = (val: any) => {
    if (!val) return "-";
    if (Array.isArray(val)) return val.join(", ");
    return String(val).replace(/([a-zà-ù])([A-Z])/g, '$1, $2');
  };

  const handleJoinTable = async (table: CoffeeTable) => {
    if (!user) return;
    
    // Confirm action
    if (!window.confirm(lang === 'IT' ? 'Vuoi inviare una richiesta per unirti a questo tavolo?' : 'Do you want to send a request to join this table?')) {
      return;
    }

    setJoiningTableId(table.id);

    try {
      // 1. Check for existing conversation
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${table.host_id}),and(user1_id.eq.${table.host_id},user2_id.eq.${user.id})`)
        .maybeSingle();

      let conversationId = existingConvs?.id;

      // 2. Create if not exists
      if (!conversationId) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: table.host_id
          })
          .select()
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      // 3. Send Message
      const message = lang === 'IT' 
        ? `Ciao! Ho visto il tuo tavolo al ${table.bar_name} per il ${table.coffee_date} alle ${table.coffee_time}. Posso unirmi?`
        : `Hi! I saw your table at ${table.bar_name} for ${table.coffee_date} at ${table.coffee_time}. Can I join?`;

      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message
        });

      if (msgError) throw msgError;

      alert(lang === 'IT' ? 'Richiesta inviata! Controlla i messaggi.' : 'Request sent! Check your messages.');
      
    } catch (error) {
      console.error('Error joining table:', error);
      alert(lang === 'IT' ? 'Errore durante l\'invio della richiesta' : 'Error sending request');
    } finally {
      setJoiningTableId(null);
    }
  };

  useEffect(() => {
    const loadInvitations = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('receiver_id', session.user.id);

      console.log('INVITI RICEVUTI:', data, error);

      if (!error && data) {
        setInvitations(data);
      }
    };

    loadInvitations();
  }, []);

  useEffect(() => {
  }, [invitations]);

  useEffect(() => {
    if (!user) return;
    fetchProfiles();
    fetchMyTable();
  }, [user]);

  const fetchMyTable = async () => {
    try {
      const { data, error } = await supabase
        .from('coffee_tables')
        .select('*')
        .eq('host_id', user.id)
        .maybeSingle();

      if (data) {
        setMyTable({
          id: data.id,
          bar: data.bar_name,
          title: data.title,
          date: data.coffee_date,
          time: data.coffee_time
        });
      }
    } catch (err) {
      console.warn('Error fetching my table:', err);
    }
  };

  const fetchTables = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase 
        .from('coffee_tables') 
        .select(`
          *,
          profiles:host_id (
            full_name,
            avatar_url
          )
        `); 

      if (data) {
        setTables(data as any);
      }
      if (error) console.log('Fetch tables error:', error);
    } catch (err) {
      console.warn('Error fetching tables:', err);
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    if (!user?.id) {
      console.warn('User not ready');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase 
      .from('profiles') 
      .select('*') 
      .neq('id', user.id); 

    console.log('PROFILES:', data); 
    console.log('ERROR:', error);

    if (!error && data) {
      setProfiles(data);
    }

    setLoading(false);
  };

  const filteredProfiles = profiles.filter(profile => 
    (profile.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.interests || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hourOptions = Array.from({ length: 17 }, (_, i) => (i + 6).toString().padStart(2, '0')); // 06 to 22
  const minuteOptions = ['00', '15', '30', '45'];

  const handleOpenMaps = () => {
    setShowMapPicker(true);
  };

  const t = {
    IT: {
      title: 'Community',
      subtitle: 'Scopri persone interessanti intorno a te',
      search: 'Cerca per nome o interessi...',
      invite: 'Invita per un caffè',
      createCoffee: 'Crea caffè',
      findCoffee: 'Trova caffè',
      noResults: 'Nessun utente trovato.',
      emptyState: 'La community sta crescendo! Torna presto per vedere nuovi profili.',
      createCoffeeTitle: 'Crea un nuovo tavolo',
      coffeeBarLabel: 'Dove preferisci prendere un caffè?',
      coffeeBarPlaceholder: 'Es. Bar Brera, Starbucks...',
      searchOnMaps: 'Cerca su Maps',
      coffeeTitleLabel: 'Dai un titolo al tuo tavolo',
      coffeeTitlePlaceholder: 'Es. Tech, Startup, Libri...',
      coffeeDateLabel: 'Giorno',
      coffeeTimeLabel: 'Orario',
      cancel: 'annulla',
      create: 'Crea',
      save: 'Salva modifiche',
      delete: 'Elimina tavolo',
      yourCoffee: 'Il tuo caffè',
      editCoffeeTitle: 'Modifica il tuo tavolo',
      errorPastDate: 'Non puoi creare un tavolo in una data passata.',
      errorInvalidTime: 'Non puoi creare un tavolo tra le 23:00 e le 06:00.',
      viewProfiles: 'Vedi profili',
      viewTables: 'Trova caffè',
      noTables: 'Nessun tavolo disponibile al momento.',
      emptyTables: 'Non ci sono tavoli attivi. Creane uno tu!'
    },
    EN: {
      title: 'Community',
      subtitle: 'Discover interesting people around you',
      search: 'Search by name or interests...',
      invite: 'Invite for a coffee',
      createCoffee: 'Create coffee',
      findCoffee: 'Find coffee',
      noResults: 'No users found.',
      emptyState: 'The community is growing! Check back soon for new profiles.',
      createCoffeeTitle: 'Create a new table',
      coffeeBarLabel: 'Where would you prefer to have coffee?',
      coffeeBarPlaceholder: 'E.g. Bar Brera, Starbucks...',
      searchOnMaps: 'Search on Maps',
      coffeeTitleLabel: 'Give your table a title',
      coffeeTitlePlaceholder: 'E.g. Tech, Startup, Books...',
      coffeeDateLabel: 'Date',
      coffeeTimeLabel: 'Time',
      cancel: 'cancel',
      create: 'Create',
      save: 'Save changes',
      delete: 'Delete table',
      yourCoffee: 'Your Coffee',
      editCoffeeTitle: 'Edit your table',
      errorPastDate: 'You cannot create a table in the past.',
      errorInvalidTime: 'You cannot create a table between 11 PM and 6 AM.',
      viewProfiles: 'View profiles',
      viewTables: 'Find coffee',
      noTables: 'No tables available at the moment.',
      emptyTables: 'There are no active tables. Create one!'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="relative flex flex-col md:block items-center">
          {onBack && (
            <div className="absolute top-0 left-0 z-10">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
          )}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mt-4 md:mt-0 md:absolute md:top-0 md:right-0 z-10">
            {myTable ? (
              <button
                onClick={() => {
                  setCoffeeBar(myTable.bar);
                  setCoffeeTitle(myTable.title);
                  setCoffeeDate(myTable.date);
                  setCoffeeTime(myTable.time);
                  setShowCreateCoffeeModal(true);
                }}
                className="flex items-center justify-center space-x-2 bg-amber-50 text-amber-800 border-[3px] border-amber-600 px-6 py-3 rounded-xl font-semibold hover:bg-amber-100 transition-colors shadow-sm"
              >
                <Coffee className="w-5 h-5" />
                <span>{t.yourCoffee}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreateCoffeeModal(true)}
                className="flex items-center justify-center space-x-2 bg-amber-50 text-amber-800 border-[3px] border-amber-600 px-6 py-3 rounded-xl font-semibold hover:bg-amber-100 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>{t.createCoffee}</span>
              </button>
            )}
            <button
              onClick={() => {
                if (viewMode === 'profiles') {
                  setViewMode('tables');
                  fetchTables();
                } else {
                  setViewMode('profiles');
                }
              }}
              className="flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Search className="w-5 h-5" />
              <span>{viewMode === 'profiles' ? t.viewTables : t.viewProfiles}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        {viewMode === 'profiles' && (
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
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-64 shadow-sm"></div>
            ))}
          </div>
        ) : viewMode === 'profiles' ? (
          filteredProfiles.length > 0 ? (
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
                            <span>{profile.preferred_zone || "Milano"}</span>
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

                    {(profile.availability_days || profile.availability_time) && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-amber-50 p-2 rounded-lg">
                          <p className="text-xs font-semibold text-amber-800 mb-1">Giorni</p>
                          <p className="text-xs text-amber-900 line-clamp-1" title={String(profile.availability_days)}>
                            {formatList(profile.availability_days)}
                          </p>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg">
                          <p className="text-xs font-semibold text-amber-800 mb-1">Orari</p>
                          <p className="text-xs text-amber-900 line-clamp-1" title={String(profile.availability_time)}>
                            {formatList(profile.availability_time)}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedProfile(profile)}
                      className="w-full flex items-center justify-center space-x-2 bg-amber-50 text-amber-800 py-3 rounded-xl font-semibold transition-all group-hover:scale-[1.02] active:scale-[0.98] hover:bg-amber-700 hover:text-white"
                    >
                      <Coffee className="w-4 h-4" />
                      <span>{t.invite}</span>
                    </button>
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
          )
        ) : (
          /* Tables Grid */
          tables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div key={table.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-100 group-hover:border-amber-300 transition-colors">
                            {table.profiles?.avatar_url ? (
                              <img src={table.profiles.avatar_url} alt={table.profiles.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-300">
                                <UserIcon className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{table.profiles?.full_name || 'Utente'}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{table.bar_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{table.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarDays className="w-4 h-4 mr-1 text-amber-600" />
                            <span>{table.coffee_date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-amber-600" />
                            <span>{table.coffee_time}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinTable(table)}
                        disabled={joiningTableId === table.id}
                        className="w-full flex items-center justify-center space-x-2 bg-amber-600 text-white py-3 rounded-xl font-semibold transition-all hover:bg-amber-700 shadow-lg shadow-amber-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joiningTableId === table.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Coffee className="w-4 h-4" />
                        )}
                        <span>{joiningTableId === table.id ? (lang === 'IT' ? 'Invio...' : 'Sending...') : 'Unisciti'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t.noTables}</h3>
              <p className="text-gray-500 mt-2">{t.emptyTables}</p>
            </div>
          )
        )}
      </div>
      
      <InvitationModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        receiver={selectedProfile}
        lang={lang}
      />

      {/* Create Coffee Modal */}
      {showCreateCoffeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{myTable ? t.editCoffeeTitle : t.createCoffeeTitle}</h3>
              <button 
                onClick={() => setShowCreateCoffeeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.coffeeBarLabel}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={coffeeBar}
                      onChange={(e) => setCoffeeBar(e.target.value)}
                      placeholder={t.coffeeBarPlaceholder}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                    />
                  </div>
                  <button
                    onClick={handleOpenMaps}
                    className="px-4 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors whitespace-nowrap"
                  >
                    {t.searchOnMaps}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.coffeeTitleLabel}</label>
                <input 
                  type="text"
                  value={coffeeTitle}
                  onChange={(e) => setCoffeeTitle(e.target.value)}
                  placeholder={t.coffeeTitlePlaceholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.coffeeDateLabel}</label>
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50 text-gray-500 pointer-events-none">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <input 
                      type="date"
                      min={new Date().toLocaleDateString('en-CA')}
                      value={coffeeDate}
                      onChange={(e) => setCoffeeDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none appearance-none bg-white cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.coffeeTimeLabel}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50 text-gray-500 pointer-events-none">
                        <Clock className="w-4 h-4" />
                      </div>
                      <select 
                        value={coffeeTime ? coffeeTime.split(':')[0] : ''}
                        onChange={(e) => {
                          const m = coffeeTime ? coffeeTime.split(':')[1] : '00';
                          setCoffeeTime(`${e.target.value}:${m}`);
                        }}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>HH</option>
                        {hourOptions.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <select 
                        value={coffeeTime ? coffeeTime.split(':')[1] : ''}
                        onChange={(e) => {
                          const h = coffeeTime ? coffeeTime.split(':')[0] : '06'; // Default to first available hour if not set
                          setCoffeeTime(`${h}:${e.target.value}`);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none appearance-none bg-white text-center"
                      >
                        <option value="" disabled>MM</option>
                        {minuteOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                {myTable ? (
                  <button
                    onClick={async () => {
                      if (confirm('Sei sicuro di voler eliminare il tavolo?')) {
                        try {
                          if (myTable?.id) {
                            await deleteTable(myTable.id);
                          }
                          
                          setMyTable(null);
                          setCoffeeBar('');
                          setCoffeeTitle('');
                          setCoffeeDate('');
                          setCoffeeTime('');
                          setShowCreateCoffeeModal(false);
                          fetchTables(); // Refresh list
                        } catch (err) {
                          console.error('Error deleting table:', err);
                          alert('Errore durante l\'eliminazione del tavolo');
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.delete}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowCreateCoffeeModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    {t.cancel}
                  </button>
                )}
                <button 
                  disabled={!coffeeBar || !coffeeTitle || !coffeeDate || !coffeeTime}
                  onClick={async () => {
                    if (!coffeeBar || !coffeeTitle || !coffeeDate || !coffeeTime) return;

                    const [year, month, day] = coffeeDate.split('-').map(Number);
                    const selectedDate = new Date(year, month - 1, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (selectedDate < today) {
                      alert(t.errorPastDate);
                      return;
                    }

                    const [hours] = coffeeTime.split(':').map(Number);
                    if (hours >= 23 || hours < 6) {
                      alert(t.errorInvalidTime);
                      return;
                    }

                    try {
                      const tableData = {
                        host_id: user.id,
                        title: coffeeTitle,
                        bar_name: coffeeBar,
                        coffee_date: coffeeDate,
                        coffee_time: coffeeTime
                      };

                      let data, error;

                      if (myTable?.id) {
                        // Update
                        console.log("UPDATING TABLE ID:", myTable.id);
                        const result = await supabase
                          .from('coffee_tables')
                          .update(tableData)
                          .eq('id', myTable.id)
                          .select()
                          .maybeSingle();
                        data = result.data;
                        error = result.error;
                      } else {
                        // Create
                        const result = await supabase
                          .from('coffee_tables')
                          .insert(tableData)
                          .select()
                          .maybeSingle();
                        data = result.data;
                        error = result.error;
                      }

                      if (error) throw error;

                      setMyTable({
                        id: data.id,
                        bar: data.bar_name,
                        title: data.title,
                        date: data.coffee_date,
                        time: data.coffee_time
                      });
                      
                      setShowCreateCoffeeModal(false);
                      setCoffeeBar('');
                      setCoffeeTitle('');
                      setCoffeeDate('');
                      setCoffeeTime('');
                      fetchTables(); // Refresh list to show the new/updated table
                    } catch (err) {
                      console.error('Error saving table:', err);
                      alert('Errore durante il salvataggio del tavolo');
                    }
                  }}
                  className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-colors shadow-lg ${
                    (!coffeeBar || !coffeeTitle || !coffeeDate || !coffeeTime)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-amber-200/50'
                  }`}
                >
                  {myTable ? t.save : t.create}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMapPicker && (
        <MapPicker
          lang={lang}
          onClose={() => setShowMapPicker(false)}
          onSelect={(location) => {
            setCoffeeBar(location);
            setShowMapPicker(false);
          }}
        />
      )}
    </div>
  );
}
