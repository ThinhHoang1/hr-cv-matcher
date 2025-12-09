
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const supabase = createClient(url, key, {
    auth: { persistSession: false }
});

async function checkDB() {
    console.log('--- Database Diagnostic ---');
    console.log('URL:', url);

    // 1. Check Table Count
    const { count, error: countError } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('❌ Error checking candidates table:', countError.message);
    } else {
        console.log(`✅ 'candidates' table row count: ${count}`);
    }

    // 2. Check Function Existence via RPC call (hacky but works if we pass nulls that fail validation later or just inspect error)
    // Better: Query information_schema
    const { data: functions, error: funcError } = await supabase
        .rpc('match_documents', { query_embedding: [], match_threshold: 0, match_count: 0 })
        .catch(e => ({ data: null, error: e }));

    // The rpc call above WILL fail with "function not found" or "invalid input"
    // Let's try to query postgres specific tables if allowed, or just assume the previous error was truth.

    // 3. Test Text Search (Simple)
    const { data: textData, error: textSearchError } = await supabase
        .from('candidates')
        .select('id, name, email')
        .limit(3);

    if (textData && textData.length > 0) {
        console.log('✅ Found some candidates:', textData.map(c => c.email).join(', '));
    } else {
        console.log('⚠️ No candidates found in simple select query.');
    }
}

checkDB();
