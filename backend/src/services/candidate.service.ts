import { supabaseAdmin } from '../db/supabase';
import { EmbeddingService } from './embedding.service';
import { GeminiService } from './gemini.service';
import { CONFIG } from '../config';

interface SearchResult {
    candidate: any;
    textScore: number;
    vectorScore: number;
    skillScore: number;
    finalScore: number;
    matchReason: string;
}

export class CandidateService {
    /**
     * Extract key skills and requirements from a job description using AI
     */
    private static async extractSearchTerms(query: string): Promise<{ skills: string[], keywords: string[], experienceLevel: string }> {
        try {
            const prompt = `
Analyze this job search query and extract key information.
Query: "${query}"

Return ONLY a valid JSON object:
{
    "skills": ["skill1", "skill2", ...], // Technical and soft skills mentioned or implied (max 10)
    "keywords": ["keyword1", "keyword2", ...], // Other important keywords (max 5)
    "experienceLevel": "junior|mid|senior|any" // Inferred experience level
}

Return ONLY the JSON, no markdown, no explanation.
`;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                }
            );

            if (!response.ok) throw new Error('Gemini API failed');

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (error) {
            console.warn('⚠️ Failed to extract search terms, using basic search');
            return { skills: [], keywords: [], experienceLevel: 'any' };
        }
    }

    /**
     * Calculate skill overlap score between query skills and candidate skills
     */
    private static calculateSkillScore(querySkills: string[], candidateSkills: string[]): number {
        if (querySkills.length === 0 || candidateSkills.length === 0) return 0;

        const querySkillsLower = querySkills.map(s => s.toLowerCase());
        const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());

        let matchCount = 0;
        for (const qs of querySkillsLower) {
            for (const cs of candidateSkillsLower) {
                // Exact match or partial match (e.g., "javascript" matches "javascript/typescript")
                if (cs.includes(qs) || qs.includes(cs)) {
                    matchCount++;
                    break;
                }
            }
        }

        return matchCount / querySkillsLower.length;
    }

    /**
     * Adjust score based on experience level matching
     */
    private static getExperienceBonus(experienceLevel: string, candidateYears: number): number {
        switch (experienceLevel) {
            case 'junior': return candidateYears <= 2 ? 0.1 : (candidateYears <= 4 ? 0.05 : 0);
            case 'mid': return (candidateYears >= 2 && candidateYears <= 6) ? 0.1 : 0.05;
            case 'senior': return candidateYears >= 5 ? 0.1 : (candidateYears >= 3 ? 0.05 : 0);
            default: return 0.05; // Small bonus for any experience
        }
    }

    /**
     * Enhanced AI-Powered Search with Multi-Factor Scoring
     */
    static async search(query: string, limit: number = 20, threshold: number = 0.3) {
        console.log('🔍 CandidateService: Enhanced AI Search for:', query);

        // 1. Extract key terms from query using AI
        const { skills: querySkills, keywords, experienceLevel } = await this.extractSearchTerms(query);
        console.log('📝 Extracted skills:', querySkills.join(', '));
        console.log('📝 Experience level:', experienceLevel);

        // 2. Get ALL candidates with raw_text for RAG
        const { data: allCandidates, error: fetchError } = await supabaseAdmin
            .from('candidates')
            .select('*, raw_text, candidate_skills(*, skill:skills(*))')
            .order('created_at', { ascending: false })
            .limit(200);

        if (fetchError) {
            console.error('❌ Failed to fetch candidates:', fetchError);
            return [];
        }

        if (!allCandidates || allCandidates.length === 0) {
            console.log('📭 No candidates in database');
            return [];
        }

        console.log(`📊 Processing ${allCandidates.length} candidates`);

        // 3. Generate query embedding for vector search
        let queryEmbedding: number[] | null = null;
        try {
            queryEmbedding = await EmbeddingService.generate(query);
        } catch (err) {
            console.warn('⚠️ Failed to generate query embedding');
        }

        // 4. Vector search via RPC (if embedding available)
        const vectorScoreMap = new Map<string, number>();
        if (queryEmbedding) {
            try {
                const { data: vectorResults } = await supabaseAdmin.rpc('match_documents', {
                    query_embedding: queryEmbedding,
                    match_threshold: threshold,
                    match_count: limit * 2
                });

                if (vectorResults) {
                    vectorResults.forEach((r: any) => {
                        vectorScoreMap.set(r.id, r.similarity);
                    });
                }
            } catch (err) {
                console.warn('⚠️ Vector search failed:', err);
            }
        }

        // 5. Score each candidate with multi-factor approach
        const queryLower = query.toLowerCase();
        const allTerms = [...querySkills, ...keywords].map(t => t.toLowerCase());

        const scoredCandidates: SearchResult[] = allCandidates.map(candidate => {
            // Extract candidate skills
            const candidateSkillNames = candidate.candidate_skills
                ?.map((cs: any) => cs.skill?.name)
                .filter(Boolean) || [];

            // Text Score (name, summary, department, raw_text match)
            let textScore = 0;
            // Use raw_text if available, otherwise use summary
            const cvContent = candidate.raw_text || candidate.summary || '';
            const searchableText = `${candidate.name} ${candidate.summary || ''} ${candidate.department || ''} ${cvContent}`.toLowerCase();

            // Check for term matches
            let termMatches = 0;
            for (const term of allTerms) {
                if (searchableText.includes(term)) termMatches++;
            }
            textScore = allTerms.length > 0 ? (termMatches / allTerms.length) * 0.6 : 0;

            // Direct query match bonus (search in raw text too)
            if (searchableText.includes(queryLower)) textScore += 0.4;

            // Vector Score
            const vectorScore = vectorScoreMap.get(candidate.id) || 0;

            // Skill Score
            const skillScore = this.calculateSkillScore(querySkills, candidateSkillNames);

            // Experience Bonus
            const expBonus = this.getExperienceBonus(experienceLevel, candidate.experience_years || 0);

            // Base score for all candidates (so we always show something)
            const baseScore = 0.1;

            // Combined Final Score (weighted) - more balanced
            // Base: 10%, Text: 15%, Vector: 45%, Skills: 25%, Experience: 5%
            const finalScore = Math.min(1.0,
                baseScore +
                (textScore * 0.15) +
                (vectorScore * 0.45) +
                (skillScore * 0.25) +
                expBonus
            );

            return {
                candidate,
                textScore,
                vectorScore,
                skillScore,
                finalScore,
                matchReason: ''
            };
        });

        // 6. Sort by final score and return top results (always return something)
        const sortedResults = scoredCandidates
            .sort((a, b) => b.finalScore - a.finalScore)
            .slice(0, limit);

        // If no results have high scores, still return top candidates
        const filteredResults = sortedResults.length > 0 ? sortedResults : scoredCandidates.slice(0, limit);

        console.log(`✅ Found ${filteredResults.length} matching candidates (top score: ${filteredResults[0]?.finalScore.toFixed(2) || 0})`);

        // 7. Generate AI insights for top results
        const resultsWithInsights = await Promise.all(
            filteredResults.map(async (result, index) => {
                const candidate = result.candidate;

                // Generate detailed match reason
                let matchReason = '';

                if (result.vectorScore > 0.7) {
                    matchReason = '🎯 Strong semantic match';
                } else if (result.skillScore > 0.5) {
                    matchReason = '🛠️ Strong skill match';
                } else if (result.textScore > 0.3) {
                    matchReason = '📝 Keyword match';
                }

                // Generate AI insight for top 5 only (to save API calls)
                if (index < 5 && result.finalScore > 0.3) {
                    try {
                        const insight = await GeminiService.generateMatchInsight(query, {
                            ...candidate,
                            finalScore: result.finalScore,
                            vectorScore: result.vectorScore,
                            skillScore: result.skillScore
                        });
                        matchReason = '✨ ' + insight;
                    } catch (err) {
                        // Keep the basic match reason
                    }
                }

                return {
                    ...candidate,
                    similarity_score: result.finalScore,
                    vector_score: result.vectorScore,
                    skill_score: result.skillScore,
                    text_score: result.textScore,
                    match_reason: matchReason || `Match score: ${Math.round(result.finalScore * 100)}%`
                };
            })
        );

        return resultsWithInsights;
    }

    /**
     * Quick search by skills only (for filtering)
     */
    static async searchBySkills(skillNames: string[], limit: number = 20) {
        const { data: candidates } = await supabaseAdmin
            .from('candidates')
            .select(`
                *,
                candidate_skills!inner(
                    skill:skills!inner(name)
                )
            `)
            .limit(limit);

        if (!candidates) return [];

        // Filter by skill names
        return candidates.filter(c => {
            const candidateSkills = c.candidate_skills?.map((cs: any) => cs.skill?.name?.toLowerCase()) || [];
            return skillNames.some(s => candidateSkills.includes(s.toLowerCase()));
        });
    }
}

