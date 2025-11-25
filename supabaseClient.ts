import { createClient } from '@supabase/supabase-js';

// These should be in your .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// We export a helper to check if supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl.length > 0 && supabaseKey.length > 0;
}

export const supabase = isSupabaseConfigured() 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;
