import { useState } from 'react';
import { supabase } from '@/src/lib/supabase-client';
import toast from 'react-hot-toast';

export interface InviteData {
    jobTitle: string;
    interviewDate: string;
    interviewTime: string;
    venue: string;
    mapLink: string;
    contactName: string;
    contactPhone: string;
    participants: string;
    language: string;
    customMessage: string;
    emailSubject: string;
    emailBody: string;
}

const DEFAULT_INVITE_DATA: InviteData = {
    jobTitle: '',
    interviewDate: '',
    interviewTime: '10:00',
    venue: '',
    mapLink: '',
    contactName: '',
    contactPhone: '',
    participants: '',
    language: 'English',
    customMessage: '',
    emailSubject: '',
    emailBody: ''
};

export function useInvite() {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState<InviteData>(DEFAULT_INVITE_DATA);
    const [isSending, setIsSending] = useState(false);

    const openInviteModal = async (hasSelectedCandidates: boolean) => {
        if (!hasSelectedCandidates) {
            toast.error('Please select candidates');
            return;
        }

        // Fetch Recruiter Profile to pre-fill
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('recruiters')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (profile) {
                setInviteData(prev => ({
                    ...prev,
                    venue: profile.address || '',
                    mapLink: profile.google_map_link || '',
                    contactName: profile.contact_name || '',
                    contactPhone: profile.contact_phone || '',
                    jobTitle: '', // Reset job title
                    interviewDate: new Date().toISOString().split('T')[0], // Today
                }));
            }
        }

        setIsInviteModalOpen(true);
    };

    const handleSendInvites = async (emails: string[], onSuccess: () => void) => {
        // Get Google Access Token from session
        const { data: { session } } = await supabase.auth.getSession();
        const googleAccessToken = session?.provider_token;

        console.log('🔑 Google Token present:', !!googleAccessToken);

        if (!googleAccessToken) {
            toast.error('⚠️ Session expired. Please Sign Out and Sign In again with Google to send emails.');
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch('/api/send-invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    emails,
                    ...inviteData,
                    googleAccessToken // Pass token to API
                }),
            });

            if (response.ok) {
                toast.success(`Sent invitations to ${emails.length} candidates`);
                setIsInviteModalOpen(false);
                onSuccess();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to send invitations');
            }
        } catch (error: any) {
            console.error('Send invite error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    return {
        isInviteModalOpen,
        setIsInviteModalOpen,
        inviteData,
        setInviteData,
        openInviteModal,
        handleSendInvites,
        isSending
    };
}
