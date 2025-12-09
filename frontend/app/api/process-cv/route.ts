import { NextResponse } from 'next/server';
import { CvProcessingService } from '@/src/lib/services/cv-processing.service';

// Force Node.js runtime for file processing libraries (pdf-parse, etc)
export const runtime = 'nodejs';
// Increase timeout for long processing
export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { filePath, userId } = body;

        if (!filePath || !userId) {
            return NextResponse.json({ error: 'File path and User ID are required' }, { status: 400 });
        }

        console.log(`Processing CV: ${filePath} for user: ${userId}`);

        // Direct service call instead of backend proxy
        const result = await CvProcessingService.processFile(userId, filePath);

        if (!result.success) {
            throw new Error(result.error || 'CV Processing failed');
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Process CV Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
