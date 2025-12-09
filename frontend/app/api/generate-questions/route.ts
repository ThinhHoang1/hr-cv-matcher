import { NextResponse } from 'next/server';
import { QuestionService } from '@/src/lib/services/question.service';
import { GeminiService } from '@/src/lib/services/gemini.service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { candidateId, jobDescription } = body;

        if (!candidateId) {
            return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
        }

        // Wait... QuestionService only takes candidateId. 
        // But GeminiService.generateInterviewQuestions takes candidate and JD.
        // Let's use GeminiService directly for better flexibility if available, 
        // OR rely on QuestionService if we want database fetching logic.
        // QuestionService fetches candidate then calls AI.
        // Let's use QuestionService for simplicity as it handles fetching.

        const questions = await QuestionService.generateQuestions(candidateId);

        return NextResponse.json(questions);

    } catch (error: any) {
        console.error('Generate Questions API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
