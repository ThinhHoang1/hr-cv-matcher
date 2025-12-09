import { supabaseAdmin } from '../supabase-admin';
import { CONFIG } from '../config';

export class QuestionService {
    private static readonly API_KEY = CONFIG.GEMINI_API_KEY;
    private static readonly MODEL = 'gemini-2.0-flash';

    static async generateQuestions(candidateId: string): Promise<string[]> {
        if (!this.API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        // 1. Fetch Candidate
        const { data: candidate, error } = await supabaseAdmin
            .from('candidates')
            .select(`
                name,
                summary,
                experience_years,
                candidate_skills (
                    skill (
                        name
                    )
                )
            `)
            .eq('id', candidateId)
            .single();

        if (error || !candidate) {
            throw new Error('Candidate not found');
        }

        const skills = candidate.candidate_skills?.map((cs: any) => cs.skill?.name).join(', ') || 'General';

        // 2. Generate Prompt
        const prompt = `
        Generate 5 interview questions for a candidate with the following profile:
        Name: ${candidate.name}
        Experience: ${candidate.experience_years} years
        Skills: ${skills}
        Summary: ${candidate.summary || 'N/A'}

        Return ONLY a JSON array of strings. Example: ["Question 1?", "Question 2?"]
        `;

        // 3. Call Gemini API
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No content generated');
            }

            // 4. Parse JSON
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);

        } catch (error: any) {
            console.error('Failed to generate questions:', error);
            // Fallback questions
            return [
                `Could you tell us about your experience with ${skills}?`,
                "What is your biggest professional achievement?",
                "How do you handle challenging projects?",
                "Where do you see yourself in 5 years?",
                "Why do you want to join our company?"
            ];
        }
    }
}
