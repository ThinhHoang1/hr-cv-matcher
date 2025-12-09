import { CONFIG } from '../config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = CONFIG.SUPABASE_URL || '';
const supabaseServiceKey = CONFIG.SUPABASE_SERVICE_KEY || '';

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
console.log('--- Supabase Init ---');
console.log('URL:', supabaseUrl);
console.log('Key type:', supabaseServiceKey ? 'service_role' : 'anon (fallback)');
console.log('Key (truncated):', keyToUse ? keyToUse.substring(0, 20) + '...' : 'MISSING');
console.log('---------------------');

export const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
    auth: {
        persistSession: false,
    }
});

