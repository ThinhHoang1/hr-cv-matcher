import { supabaseAdmin } from '../db/supabase';
import axios from 'axios';

export interface InvitationData {
    emails: string[];
    jobTitle?: string;
    customMessage?: string;
    emailSubject?: string;
    emailBody?: string;
    interviewDate?: string;
    interviewTime?: string;
    venue?: string;
    mapLink?: string;
    contactName?: string;
    contactPhone?: string;
    participants?: string;
    language?: string;
    googleAccessToken?: string;
}

import { CONFIG } from '../config';

export class InvitationService {
    private static readonly WEBHOOK_URL = CONFIG.N8N_WEBHOOK_SEND_MAIL;

    static async sendInvitations(data: InvitationData) {
        const { emails, googleAccessToken, ...inviteDetails } = data;

        console.log('🚀 InvitationService: Sending to', emails);

        if (!emails || emails.length === 0) {
            throw new Error('Email addresses are required');
        }

        // 1. Fetch Candidates
        const { data: candidates, error: fetchError } = await supabaseAdmin
            .from('candidates')
            .select('*')
            .in('email', emails);

        if (fetchError) throw new Error('Failed to fetch candidate details');
        if (!candidates || candidates.length === 0) throw new Error('No candidates found');

        // 2. Prepare Payload
        const candidatesPayload = candidates.map(c => ({
            name: c.name,
            email: c.email,
            skills: '',
            summary: c.summary,
            experience_years: c.experience_years
        }));

        const recruiterEmail = 'recruiter@example.com';

        // 3. Try n8n Webhook (with graceful fallback)
        let n8nSuccess = false;
        try {
            const response = await axios.post(this.WEBHOOK_URL, {
                candidates: candidatesPayload,
                ...inviteDetails,
                replyTo: recruiterEmail,
                googleAccessToken
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000 // 15 second timeout
            });

            if (response.status === 200) {
                n8nSuccess = true;
                console.log('✅ N8N email webhook succeeded');
            }
        } catch (n8nError: any) {
            console.warn('⚠️ N8N webhook unavailable:', n8nError.message);
            console.log('📧 Continuing with invitation recording (emails would be sent in production with proper SMTP/Gmail setup)');
        }

        // 4. Save Invitations & Update Status (regardless of n8n status)
        let savedCount = 0;
        for (const candidate of candidates) {
            try {
                // Insert invitation record
                const { error: insertError } = await supabaseAdmin.from('invitations').insert({
                    candidate_id: candidate.id,
                    user_id: candidate.user_id,
                    status: n8nSuccess ? 'sent' : 'pending',
                    job_title: inviteDetails.jobTitle || null,
                    interview_date: inviteDetails.interviewDate || null,
                });

                if (!insertError) {
                    savedCount++;
                    // Update candidate status
                    await supabaseAdmin
                        .from('candidates')
                        .update({ status: 'interviewing' })
                        .eq('id', candidate.id);
                } else {
                    console.error('Error saving invitation:', insertError);
                }
            } catch (err: any) {
                console.error('Error processing invitation for', candidate.email, err.message);
            }
        }

        const statusMessage = n8nSuccess
            ? `Successfully sent ${savedCount} invitations via email`
            : `Recorded ${savedCount} invitations (N8N email service unavailable - emails pending)`;

        return {
            success: true,
            sent: savedCount,
            n8nStatus: n8nSuccess ? 'connected' : 'unavailable',
            message: statusMessage
        };
    }
}

