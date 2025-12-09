import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

const supabaseUrl = CONFIG.SUPABASE_URL || '';
const supabaseServiceKey = CONFIG.SUPABASE_SERVICE_ROLE_KEY || '';

// Fallback to anon key for development if service role key is not valid
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const keyToUse = supabaseServiceKey || ANON_KEY;

if (!supabaseUrl) {
    console.error('❌ CRITICAL: SUPABASE_URL is missing!');
}

if (!supabaseServiceKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing, using anon key (limited permissions)');
}

// Server-side admin client
export const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
    auth: {
        persistSession: false,
    }
});
