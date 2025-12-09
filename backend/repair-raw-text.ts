/**
 * Script to REPAIR missing raw_text for existing candidates
 * Run with: npx ts-node repair-raw-text.ts
 */

import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './src/config';

// Use config directly or hardcode if needed for script
const SUPABASE_URL = 'https://zwektghppstkzdrvboxk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZWt0Z2hwcHN0a3pkcnZib3hrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NjEyNCwiZXhwIjoyMDgwMjUyMTI0fQ.ky4ZF9akxVApkwL83xbFkyEn7bq-LFdgsYtORti7Dn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('🔧 Starting Repair Job: Filling empty raw_text...\n');

    // 1. Get candidates with empty or null raw_text
    const { data: candidates, error } = await supabase
        .from('candidates')
        .select(`
            id, 
            name, 
            email, 
            phone, 
            experience_years, 
            department, 
            summary, 
            raw_text
        `);

    if (error || !candidates) {
        console.error('❌ Failed to fetch candidates:', error);
        return;
    }

    const candidatesToFix = candidates.filter(c => !c.raw_text || c.raw_text.length < 50 || c.raw_text === 'EMPTY');
    console.log(`Found ${candidatesToFix.length} candidates needing repair out of ${candidates.length} total.\n`);

    let updatedCount = 0;

    for (const c of candidatesToFix) {
        try {
            // Construct detailed text from structured data
            const skills = 'See skills in profile';

            const constructedText = `
Name: ${c.name || 'Unknown'}
Email: ${c.email || ''}
Phone: ${c.phone || ''}
Experience: ${c.experience_years || 0} years
Department: ${c.department || 'General'}
Skills: ${skills}
Professional Summary: ${c.summary || ''}
            `.trim();

            console.log(`🛠️ Fixing ${c.name}...`);

            const { error: updateError } = await supabase
                .from('candidates')
                .update({
                    raw_text: constructedText,
                    updated_at: new Date().toISOString()
                })
                .eq('id', c.id);

            if (updateError) {
                console.error(`  ❌ Failed: ${updateError.message}`);
            } else {
                console.log(`  ✅ Repaired (Length: ${constructedText.length} chars)`);
                updatedCount++;
            }

        } catch (err: any) {
            console.error(`  ❌ Error processing ${c.name}:`, err.message);
        }
    }

    console.log(`\n✨ Repair Complete! Updated ${updatedCount} candidates.`);
}

main().catch(console.error);
