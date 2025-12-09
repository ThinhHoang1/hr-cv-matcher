import { NextResponse } from 'next/server';
import { CandidateService } from '@/src/lib/services/candidate.service';

export const runtime = 'nodejs';
export const maxDuration = 60; // AI Search can take time

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, threshold, limit } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        console.log(`Searching candidates for: ${query}`);

        // Direct service call
        const results = await CandidateService.search(query, limit || 20, threshold || 0.3);

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
