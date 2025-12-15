/**
 * Script to verify ONE file extraction
 * Run with: npx ts-node verify-extraction.ts
 */

import { createClient } from '@supabase/supabase-js';
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import { Buffer } from 'buffer';

import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

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
