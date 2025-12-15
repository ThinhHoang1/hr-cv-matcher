/**
 * Script to backfill raw_text by downloading files from Storage
 * Run with: npx ts-node backfill-raw-text.ts
 */

import { createClient } from '@supabase/supabase-js';
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import { Buffer } from 'buffer';

// Hardcode credentials to avoid env issues in script
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// const GEMINI_KEY = 'AI...'; // The user has this in .env, but for script we need it here. I will use the one from CONFIG logic if I can, but since this is a standalone script...
// I will fetch it from the environment variable if possible, or ask the user. Wait, I see it usage in other files.
// Let's assume process.env is not reliable without dotenv, so I'll trust the user to have it or use a placeholder they can fill, OR better: use the one I saw in config earlier.

// Looking at previous context, checking if I saw the key... I see `GEMINI_API_KEY` in `cv-processing.service.ts` references `CONFIG`.
// I will try to read .env file manually in this script to be safe.

const fs = require('fs');
const path = require('path');
// Try to load from root config or local file
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.error('❌ Missing GEMINI_API_KEY in .env');
        return '';
    }

    try {
        const base64Data = buffer.toString('base64');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Extract all text from this resume document verbatim. Return ONLY the text, no markdown formatting." },
                            { inline_data: { mime_type: mimeType, data: base64Data } }
                        ]
                    }]
                }),
            }
        );

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error: any) {
        console.error('  ❌ Gemini extraction failed:', error.message);
    }
    return '';
}

async function main() {
    console.log('🔄 Starting Full Text Recovery from Storage...\n');

    const { data: candidates, error } = await supabase
        .from('candidates')
        .select('id, name, cv_file_path')
        .not('cv_file_path', 'is', null);

    if (error) {
        console.error('Error fetching candidates:', error);
        return;
    }

    console.log(`Found ${candidates?.length} candidates with files.`);

    for (const c of candidates || []) {
        console.log(`\n📄 Processing: ${c.name}`);

        if (!c.cv_file_path) {
            console.log('  ⚠️ No file path, skipping.');
            continue;
        }

        // Download file
        const { data: blob, error: dlError } = await supabase.storage
            .from('cvs')
            .download(c.cv_file_path);

        if (dlError || !blob) {
            console.log(`  ❌ Download failed: ${dlError?.message}`);
            continue;
        }

        // Convert Blob to Buffer
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const isPdf = c.cv_file_path.toLowerCase().endsWith('.pdf');
        const mimeType = isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const fullText = await extractText(buffer, mimeType);

        if (fullText && fullText.length > 100) {
            console.log(`  ✅ Extracted ${fullText.length} chars`);

            // Clean text
            const cleanText = fullText
                .replace(/\s+/g, ' ')
                .replace(/[^\w\s@.,\-()]/g, '')
                .substring(0, 50000);

            // Construct enriched text
            const enrichedText = `
CANDIDATE PROFILE:
Name: ${c.name}
Full CV Content Recovery

FULL CV CONTENT:
${cleanText}
`.trim();

            // Update DB
            const { error: upError } = await supabase
                .from('candidates')
                .update({
                    raw_text: cleanText, // Store the CLEAN raw text
                    updated_at: new Date().toISOString()
                })
                .eq('id', c.id);

            if (upError) console.error(`  ❌ Update failed: ${upError.message}`);
            else console.log(`  💾 Updated DB successfully`);

        } else {
            console.log('  ⚠️ Extracted text was empty or too short');
        }
    }
}

main().catch(console.error);

