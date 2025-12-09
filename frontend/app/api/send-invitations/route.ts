import { NextResponse } from 'next/server';
import { InvitationService } from '@/src/lib/services/invitation.service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Direct service call
        const result = await InvitationService.sendInvitations(body);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Send Invitation API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
