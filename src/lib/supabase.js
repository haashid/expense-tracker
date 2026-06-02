import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are actual values or placeholders
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'your_supabase_project_url' && 
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
