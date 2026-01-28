import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { User as UserIcon, Save, Loader2, Camera, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropImage';

interface ProfileViewProps {
  user: User;
  lang: 'IT' | 'EN';
}

export default function ProfileView({ user, lang }: ProfileViewProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    interests: '',
    preferred_zone: '',
    availability_days: '',
    availability_time: ''
  });

  const zones = [
    'Città Studi',
    'Bocconi / Navigli',
    'Bicocca',
    'Porta Garibaldi / Isola',
    'Bovisa',
    'St. Amborgio',
    'CityLife',
    'Indifferente'
  ];
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const arrayToInput = (v: unknown) =>
    Array.isArray(v) ? v.join(', ') : (v ?? '');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        interests: user.user_metadata?.interests || '',
        preferred_zone: user.user_metadata?.preferred_zone || '',
        availability_days: arrayToInput(user.user_metadata?.availability_days),
        availability_time: arrayToInput(user.user_metadata?.availability_time)
      });
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const labels = {
    IT: {
      title: 'Il tuo Profilo',
      name: 'Nome Completo',
      interests: 'Di cosa ti occupi? / Interessi',
      daysLabel: 'Che giorni sei libero per un caffè?',
      timeLabel: 'A che ora sei libero per un caffè?',
      zone: 'Zona preferita',
      save: 'Salva Modifiche',
      saving: 'Salvataggio...',
      success: 'Profilo aggiornato con successo!',
      error: 'Errore durante l\'aggiornamento.',
      desc: 'Gestisci le tue informazioni personali e i tuoi interessi per migliorare i match.',
      changePhoto: 'Cambia foto',
      uploading: 'Caricamento...',
      uploadError: 'Errore caricamento foto',
      uploadSuccess: 'Foto aggiornata!'
    },
    EN: {
      title: 'Your Profile',
      name: 'Full Name',
      interests: 'Occupation / Interests',
      daysLabel: 'Which days are you free for a coffee?',
      timeLabel: 'What time are you free for a coffee?',
      zone: 'Preferred Zone',
      save: 'Save Changes',
      saving: 'Saving...',
      success: 'Profile updated successfully!',
      error: 'Error updating profile.',
      desc: 'Manage your personal information and interests to improve your matches.',
      changePhoto: 'Change photo',
      uploading: 'Uploading...',
      uploadError: 'Error uploading photo',
      uploadSuccess: 'Photo updated!'
    }
  };

  const t = labels[lang];

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, interests, avatar_url, preferred_zone, availability_days, availability_time')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setFormData({
          full_name: data.full_name || '',
          interests: data.interests || '',
          preferred_zone: data.preferred_zone || '',
          availability_days: arrayToInput(data.availability_days),
          availability_time: arrayToInput(data.availability_time)
        });
        setAvatarUrl(data.avatar_url || null);
      }
    };
    load();
  }, [user]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      setUploading(true);
      setMessage({ type: '', text: '' });
      
      if (!tempImageSrc || !croppedAreaPixels) return;

      const croppedImageBlob = await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels
      );

      if (!croppedImageBlob) throw new Error('Could not crop image');

      const fileName = `${user.id}-${Math.random()}.jpg`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageBlob);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase 
        .from('profiles') 
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id); 
 
      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(data.publicUrl);
      setMessage({ type: 'success', text: t.uploadSuccess });
      setIsCropping(false);
      setTempImageSrc(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: t.uploadError });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const parseList = (s: string) =>
      s.split(",").map(x => x.trim()).filter(Boolean);

    const toPgArrayLiteral = (values: string[]) =>
      `{${values.map(v => `"${v.replace(/"/g, '\\"')}"`).join(',')}}`;

    const availabilityDaysArray = parseList(formData.availability_days);
    const availabilityTimeArray = parseList(formData.availability_time);
    const availabilityDaysLiteral = toPgArrayLiteral(availabilityDaysArray);
    const availabilityTimeLiteral = toPgArrayLiteral(availabilityTimeArray);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser() 
      console.log(authUser)

      const { data: { session } } = await supabase.auth.getSession(); 
 
      if (!session) { 
        console.error('Sessione mancante'); 
        return; 
      } 
 
      const sessionUser = session.user; 
 
      const { error } = await supabase 
        .from('profiles') 
        .update({ 
          full_name: formData.full_name, 
          interests: formData.interests,
          preferred_zone: formData.preferred_zone,
          availability_days: availabilityDaysLiteral,
          availability_time: availabilityTimeLiteral
        }) 
        .eq('id', sessionUser.id); 
 
      if (error) { 
        console.error('UPDATE ERROR:', error); 
        throw error;
      } 

      setMessage({ type: 'success', text: t.success });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: t.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 pt-32">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-100 shadow-lg">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-amber-300" />
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Camera className="w-8 h-8" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t.changePhoto}</p>
        </div>

        {isCropping && tempImageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full">
              <div className="relative h-64 sm:h-80 w-full bg-gray-900">
                <Cropper
                  image={tempImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={true}
                />
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsCropping(false);
                      setTempImageSrc(null);
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Annulla</span>
                  </button>
                  <button
                    onClick={handleCropSave}
                    disabled={uploading}
                    className="flex-1 py-3 px-4 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    <span>Salva</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.name}</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.interests}</label>
            <textarea
              rows={4}
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.daysLabel}</label>
            <input
              type="text"
              value={formData.availability_days}
              onChange={(e) => setFormData({ ...formData, availability_days: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
              placeholder={lang === 'IT' ? "Es. Lunedì, Mercoledì..." : "Ex. Monday, Wednesday..."}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.timeLabel}</label>
            <input
              type="text"
              value={formData.availability_time}
              onChange={(e) => setFormData({ ...formData, availability_time: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
              placeholder={lang === 'IT' ? "Es. Pausa pranzo, dopo le 18..." : "Ex. Lunch break, after 6pm..."}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.zone}</label>
            <select
              value={formData.preferred_zone}
              onChange={(e) => setFormData({ ...formData, preferred_zone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-white"
              required
            >
              <option value="" disabled>Seleziona una zona</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-800 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.saving}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t.save}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
