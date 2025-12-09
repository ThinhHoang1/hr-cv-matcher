import { CONFIG } from '../config';

export class EmbeddingService {
    private static readonly API_KEY = CONFIG.GEMINI_API_KEY;
    private static readonly MODEL = 'models/text-embedding-004';

    /**
     * Generate embedding vector from text
     * @param text - Text to embed
     * @returns Array of 768 numbers
     */
    static async generate(text: string): Promise<number[]> {
        if (!this.API_KEY) {
            throw new Error('GEMINI_API_KEY is not set. Add it to .env.local');
        }

        if (!text || text.trim() === '') {
            throw new Error('Text cannot be empty');
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/${this.MODEL}:embedContent?key=${this.API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: {
                            parts: [{ text: text.trim() }]
                        }
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const embedding = data.embedding?.values;

            if (!embedding || !Array.isArray(embedding)) {
                throw new Error('Invalid embedding response from Gemini API');
            }

            return embedding;
        } catch (error: any) {
            console.error('Error generating embedding:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }
}
