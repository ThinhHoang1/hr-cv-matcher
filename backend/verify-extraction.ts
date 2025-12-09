/**
 * Script to verify ONE file extraction
 * Run with: npx ts-node verify-extraction.ts
 */

import { createClient } from '@supabase/supabase-js';
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import { Buffer } from 'buffer';

const SUPABASE_URL = 'https://zwektghppstkzdrvboxk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZWt0Z2hwcHN0a3pkcnZib3hrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NjEyNCwiZXhwIjoyMDgwMjUyMTI0fQ.ky4ZF9akxVApkwL83xbFkyEn7bq-LFdgsYtORti7Dn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('🔍 picking one candidate with file...');

    const { data: candidates } = await supabase
        .from('candidates')
        .select('name, cv_file_path')
        .not('cv_file_path', 'is', null)
        .limit(1);

    if (!candidates || candidates.length === 0) {
        console.log('No candidates with files found.');
        return;
    }

    const c = candidates[0];
    console.log(`Processing: ${c.name} (${c.cv_file_path})`);

    const { data: blob, error } = await supabase.storage
        .from('cvs')
        .download(c.cv_file_path);

    if (error || !blob) {
        console.error('Download failed:', error);
        return;
    }

    console.log(`Downloaded ${blob.size} bytes`);

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';

    try {
        if (c.cv_file_path.endsWith('.pdf')) {
            console.log('Parsing PDF...');
            const data = await pdf(buffer);
            text = data.text;
        } else {
            console.log('Parsing DOCX...');
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        }
    } catch (e: any) {
        console.error('Parsing failed:', e.message);
    }

    console.log('\n--- EXTRACTED TEXT START ---');
    console.log(text.substring(0, 1000)); // Print first 1000 chars
    console.log('--- EXTRACTED TEXT END ---\n');
    console.log(`Total Length: ${text.length} chars`);
}

main().catch(console.error);
