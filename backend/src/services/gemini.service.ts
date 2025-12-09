import { CONFIG } from '../config';

/**
 * Service for interacting with Google Gemini API for text generation
 */
export class GeminiService {
    private static readonly API_KEY = CONFIG.GEMINI_API_KEY;
    private static readonly MODEL = 'gemini-2.0-flash';

    /**
     * Generate text content from a prompt
     */
    static async generateText(prompt: string): Promise<string> {
        if (!this.API_KEY) {
            console.error('❌ GEMINI_API_KEY is missing in environment variables');
            throw new Error('GEMINI_API_KEY is not set');
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Gemini API Error (${response.status}):`, errorText);
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.warn('⚠️ Gemini response missing text:', JSON.stringify(data));
                return 'Could not generate response.';
            }

            return text;
        } catch (error: any) {
            console.error('❌ Error generating text:', error.message);
            return 'AI generation failed.';
        }
    }

    /**
     * Generate a detailed insight explaining why a candidate matches a query
     */
    static async generateMatchInsight(query: string, candidate: any): Promise<string> {
        const skills = candidate.candidate_skills?.map((cs: any) => cs.skill?.name).filter(Boolean).join(', ') || 'Not specified';

        const prompt = `
You are an expert HR Recruiter analyzing a candidate match.

Job Search Query: "${query}"

Candidate Profile:
- Name: ${candidate.name}
- Experience: ${candidate.experience_years || 0} years
- Skills: ${skills}
- Department: ${candidate.department || 'Not specified'}
- Summary: ${candidate.summary || 'Not available'}
${candidate.vectorScore ? `- Semantic Match Score: ${Math.round(candidate.vectorScore * 100)}%` : ''}
${candidate.skillScore ? `- Skill Match Score: ${Math.round(candidate.skillScore * 100)}%` : ''}

Write ONE concise sentence (max 25 words) explaining why this candidate is a good match.
Focus on SPECIFIC skills, experience, or qualifications that align with the search.
Start directly with the reason (no "Matches because..." prefix).
Be specific and actionable for a recruiter.
`;

        return this.generateText(prompt);
    }

    /**
     * Compare candidates based on a job description or query
     */
    static async compareCandidates(query: string, candidates: any[]): Promise<string> {
        const candidatesInfo = candidates.map((c, i) => `
        ${i + 1}. ${c.name}
           Experience: ${c.experience_years} years
           Skills: ${c.candidate_skills?.map((cs: any) => cs.skill?.name).join(', ') || 'N/A'}
           Summary: ${c.summary || 'N/A'}
           Match Score: ${Math.round((c.similarity_score || 0) * 100)}%
        `).join('\n');

        const prompt = `
You are an expert HR Recruiter. Compare these candidates for the role:

Job Requirements: "${query}"

Candidates:
${candidatesInfo}

Provide:
1. A brief comparison table (Name | Strengths | Considerations | Fit Score /10)
2. Top recommendation with reasoning
3. Any concerns or additional questions to ask

Keep it concise and actionable.
`;

        return this.generateText(prompt);
    }

    /**
     * Generate interview questions based on candidate profile and job
     */
    static async generateInterviewQuestions(candidate: any, jobDescription?: string): Promise<string[]> {
        const skills = candidate.candidate_skills?.map((cs: any) => cs.skill?.name).join(', ') || 'general';

        const prompt = `
Generate 5 targeted interview questions for this candidate:

Candidate: ${candidate.name}
Experience: ${candidate.experience_years} years
Skills: ${skills}
Summary: ${candidate.summary || 'N/A'}
${jobDescription ? `Job: ${jobDescription}` : ''}

Return ONLY a JSON array of 5 questions, like: ["Question 1?", "Question 2?", ...]
Questions should be specific to the candidate's background and skills.
Include a mix of technical, behavioral, and situational questions.
`;

        try {
            const response = await this.generateText(prompt);
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch {
            return [
                `Tell us about your experience with ${skills.split(',')[0] || 'your primary skill'}.`,
                "Describe a challenging project you've worked on and how you handled it.",
                "How do you stay updated with industry trends?",
                "Where do you see yourself in 3-5 years?",
                "What interests you about this opportunity?"
            ];
        }
    }
}

