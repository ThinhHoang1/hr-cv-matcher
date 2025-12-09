import { supabaseAdmin } from '../supabase-admin';
import { EmbeddingService } from './embedding.service';
import axios from 'axios';
import FormData from 'form-data';
import mammoth from 'mammoth';
import { CONFIG } from '../config';

export interface ProcessedResult {
    success: boolean;
    candidate?: any;
    error?: string;
}

export class CvProcessingService {
    private static readonly WEBHOOK_URL = CONFIG.N8N_WEBHOOK_UPLOAD;
    private static readonly GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;

    private static async extractText(buffer: Buffer, mimeType: string): Promise<string> {
        console.log(`🔍 Extracting text from ${mimeType} using GEMINI 2.0 FLASH...`);

        try {
            // Convert buffer to base64
            const base64Data = buffer.toString('base64');

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "Extract all text from this resume document verbatim. Return ONLY the text, no markdown formatting." },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Data
                                    }
                                }
                            ]
                        }]
                    }),
                }
            );

            if (!response.ok) {
                console.error(`Gemini API Error: ${response.status} ${response.statusText}`);
                const errText = await response.text();
                // console.error(errText); // Reduce noise
                throw new Error('Gemini extraction failed');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            console.log(`✅ Gemini extracted: ${text.length} characters`);
            return text;

        } catch (error: any) {
            console.error('❌ Gemini Text extraction failed:', error.message);
            // Fallback: DOCX only
            try {
                if (mimeType.includes('word') || mimeType.includes('docx')) {
                    const result = await mammoth.extractRawText({ buffer });
                    return result.value || '';
                } else {
                    console.warn('⚠️ PDF fallback not available in serverless environment (requires pdf-parse which is incompatible). Relying on Gemini.');
                }
            } catch (e) {
                console.error('Local fallback failed too');
            }
        }
        return '';
    }

    /**
     * Parse CV text using Gemini AI when n8n is unavailable
     */
    private static async parseWithGemini(text: string, fileName: string): Promise<any> {
        if (!this.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const prompt = `
You are an expert HR assistant. Analyze this CV/resume text and extract structured information.
Return ONLY a valid JSON object with these fields:
{
    "name": "Full name of the candidate",
    "email": "Email address (or null if not found)",
    "phone": "Phone number (or null if not found)", 
    "experience_years": <number of years of experience, estimate from work history>,
    "summary": "A 2-3 sentence professional summary",
    "skills": ["skill1", "skill2", ...] (extract up to 10 key technical/professional skills)
}

CV Text:
${text.substring(0, 10000)}

Important: Return ONLY the JSON object, no markdown, no explanation.
`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Clean and parse JSON
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            console.log('✅ Gemini AI parsed CV successfully');
            return parsed;
        } catch (error: any) {
            console.error('❌ Gemini parsing failed:', error.message);
            throw error;
        }
    }

    static async processFile(userId: string, filePath: string): Promise<ProcessedResult> {
        console.log(`📂 CvProcessingService: Processing file ${filePath} for user ${userId}`);

        try {
            // 1. Download file from Supabase Storage
            const { data: fileBlob, error: downloadError } = await supabaseAdmin
                .storage
                .from('cvs')
                .download(filePath);

            if (downloadError || !fileBlob) {
                throw new Error(`Failed to download file: ${downloadError?.message || 'Unknown error'}`);
            }

            // Convert Blob to Buffer
            const arrayBuffer = await fileBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const fileName = filePath.split('/').pop() || 'unknown.pdf';
            const contentType = fileName.endsWith('.pdf') ? 'application/pdf' :
                fileName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                    'application/octet-stream';

            // Get Public URL
            const { data: { publicUrl } } = supabaseAdmin
                .storage
                .from('cvs')
                .getPublicUrl(filePath);

            // 2. Extract text from file
            const fullText = await this.extractText(buffer, contentType);
            console.log(`📝 Extracted ${fullText.length} characters from ${fileName}`);

            // 3. Try n8n first, then fall back to Gemini AI
            let candidateData: any = null;
            let useN8n = true;

            try {
                if (this.WEBHOOK_URL) {
                    // Prepare FormData for n8n
                    const n8nFormData = new FormData();
                    n8nFormData.append('cv_0', buffer, {
                        filename: fileName,
                        contentType: contentType,
                        knownLength: buffer.length
                    });

                    const response = await axios.post(this.WEBHOOK_URL, n8nFormData, {
                        headers: { ...n8nFormData.getHeaders() },
                        maxBodyLength: Infinity,
                        maxContentLength: Infinity,
                        timeout: 30000 // 30 seconds timeout
                    });

                    const n8nData = response.data;
                    console.log('✅ N8N Parsing Response received');

                    // Extract candidate data from n8n response
                    if (n8nData.candidates && Array.isArray(n8nData.candidates) && n8nData.candidates.length > 0) {
                        candidateData = n8nData.candidates[0];
                    } else if (n8nData.candidates && !Array.isArray(n8nData.candidates)) {
                        candidateData = n8nData.candidates;
                    } else if (Array.isArray(n8nData) && n8nData.length > 0) {
                        candidateData = n8nData[0];
                    } else {
                        candidateData = n8nData;
                    }
                } else {
                    useN8n = false;
                }
            } catch (n8nError: any) {
                console.warn('⚠️ N8N unavailable, falling back to Gemini AI:', n8nError.message);
                useN8n = false;
            }

            // 4. If n8n failed or returned no data, use Gemini AI
            if (!useN8n || !candidateData || (!candidateData.name && !candidateData.email)) {
                if (fullText.length > 50) {
                    try {
                        candidateData = await this.parseWithGemini(fullText, fileName);
                    } catch (geminiError) {
                        console.warn('⚠️ Gemini AI also failed, using basic extraction');
                    }
                }
            }

            // 5. Final fallback to filename-based data
            if (!candidateData || (!candidateData.name && !candidateData.email)) {
                candidateData = {
                    name: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
                    email: `candidate-${Date.now()}-${Math.floor(Math.random() * 1000)}@uploaded.local`,
                    phone: '',
                    experience_years: 0,
                    summary: fullText.substring(0, 500) || 'Uploaded CV',
                    skills: []
                };
                console.log('⚠️ Using fallback candidate data');
            }

            const uniqueEmail = candidateData.email || `candidate-${Date.now()}@uploaded.local`;

            // Helper to infer department
            const inferDepartment = (summary: string, skills: string[]): string => {
                const text = (summary + ' ' + skills.join(' ')).toLowerCase();
                if (text.includes('marketing') || text.includes('seo') || text.includes('content') || text.includes('social media')) return 'Marketing';
                if (text.includes('sales') || text.includes('business development')) return 'Sales';
                if (text.includes('hr') || text.includes('recruitment')) return 'HR';
                if (text.includes('finance') || text.includes('accounting')) return 'Finance';
                return 'Technology';
            };

            const department = candidateData.department || inferDepartment(candidateData.summary || '', candidateData.skills || []);

            // 6. Generate Enhanced Embedding (FULL RAW TEXT + SEMANTIC ENRICHMENT)
            let embedding = null;
            let rawText = fullText.trim();

            console.log(`📄 Raw text extracted: ${rawText.length} characters`);

            // FALLBACK: If PDF extraction failed, create raw text from parsed data
            if (rawText.length < 100) {
                console.warn('⚠️ PDF extraction failed or returned very little. Creating raw_text from parsed data...');
                const skills = Array.isArray(candidateData.skills) ? candidateData.skills.join(', ') : '';
                rawText = `
Name: ${candidateData.name || 'Unknown'}
Email: ${candidateData.email || ''}
Phone: ${candidateData.phone || ''}
Experience: ${candidateData.experience_years || 0} years
Department: ${department}
Skills: ${skills}
Summary: ${candidateData.summary || ''}
`.trim();
            }

            try {
                // Clean and preprocess text for better embedding
                const cleanText = rawText
                    .replace(/\s+/g, ' ')           // Normalize whitespace
                    .replace(/[^\w\s@.,\-()]/g, '') // Remove special chars but keep email/phone
                    .substring(0, 15000);           // Limit to ~15k chars (embedding model limit)

                // Create enriched embedding text with structured header + full content
                const skills = Array.isArray(candidateData.skills) ? candidateData.skills.join(', ') : '';
                const enrichedText = `
CANDIDATE PROFILE:
Name: ${candidateData.name || 'Unknown'}
Department: ${department}
Experience: ${candidateData.experience_years || 0} years
Key Skills: ${skills}
Professional Summary: ${candidateData.summary || ''}

FULL CV CONTENT:
${cleanText}
`.trim();

                console.log(`📝 Embedding: Full RAW text (${cleanText.length} chars) + structured header`);

                if (enrichedText.length > 100) {
                    embedding = await EmbeddingService.generate(enrichedText);
                    console.log('✅ Generated RAG embedding:', embedding.length, 'dimensions');
                }
            } catch (embErr: any) {
                console.error('⚠️ Failed to generate embedding:', embErr.message);
            }

            // Prepare data for upsert
            const candidateRecord = {
                user_id: userId,
                name: candidateData.name || 'Unknown',
                email: uniqueEmail,
                phone: candidateData.phone || '',
                experience_years: typeof candidateData.experience_years === 'number' ? candidateData.experience_years : 0,
                summary: candidateData.summary || '',
                status: 'new',
                department: department,
                cv_file_url: publicUrl,
                cv_file_path: filePath,
                embedding: embedding || null,
                raw_text: rawText.substring(0, 50000), // Store raw CV text (up to 50k chars) for RAG
                updated_at: new Date().toISOString()
            };

            const result = await supabaseAdmin
                .from('candidates')
                .upsert(candidateRecord, { onConflict: 'email, user_id' })
                .select()
                .single();

            if (result.error) {
                console.error('❌ Upsert error:', result.error);
                throw result.error;
            }
            const candidate = result.data;
            console.log(`✅ Saved candidate: ${candidate?.name}`);


            // 8. Insert Skills
            if (candidateData.skills && Array.isArray(candidateData.skills)) {
                for (const skillName of candidateData.skills) {
                    if (!skillName || typeof skillName !== 'string') continue;

                    const { data: skill } = await supabaseAdmin
                        .from('skills')
                        .upsert({ name: skillName.trim(), category: 'technical' }, { onConflict: 'name' })
                        .select().single();

                    if (skill && candidate) {
                        await supabaseAdmin.from('candidate_skills').upsert({
                            candidate_id: candidate.id,
                            skill_id: skill.id,
                            proficiency_level: 'intermediate',
                        }, { onConflict: 'candidate_id, skill_id' });
                    }
                }
            }

            return { success: true, candidate };

        } catch (err: any) {
            console.error(`❌ Error processing ${filePath}:`, err.message);
            return { success: false, error: err.message };
        }
    }
}
