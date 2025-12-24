import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback.');
}

// Ensure we have valid strings for the client, even if dummy ones
const url = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';
  
const key = supabaseAnonKey && supabaseAnonKey.length > 0 
  ? supabaseAnonKey 
  : 'placeholder-key';

export const supabase = createClient(url, key);
