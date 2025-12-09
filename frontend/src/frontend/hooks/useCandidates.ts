import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase-client';
import { Candidate } from '@/src/shared/types';
import toast from 'react-hot-toast';

export function useCandidates() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadCandidates();

        const channel = supabase
            .channel('candidates_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'candidates' },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        loadCandidates();
                    } else if (payload.eventType === 'DELETE') {
                        setCandidates(prev => prev.filter(c => c.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        loadCandidates();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function loadCandidates() {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .select('*, candidate_skills(*, skill:skills(*))')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCandidates(data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedCandidates(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const handleDelete = async () => {
        try {
            const idsToDelete = Array.from(selectedCandidates);
            const { error } = await supabase.from('candidates').delete().in('id', idsToDelete);

            if (error) throw error;

            toast.success(`Deleted ${idsToDelete.length} candidates`);
            setCandidates(prev => prev.filter(c => !selectedCandidates.has(c.id)));
            setSelectedCandidates(new Set());
        } catch (error: any) {
            toast.error(`Failed to delete: ${error.message}`);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        setCandidates(prev => prev.map(c =>
            c.id === id ? { ...c, status: newStatus } : c
        ));

        try {
            const { error } = await supabase
                .from('candidates')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success('Status updated');
        } catch (error: any) {
            toast.error('Failed to update status');
            // Revert on error
            loadCandidates();
        }
    };

    const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
        // Optimistic update
        setCandidates(prev => prev.map(c =>
            c.id === id ? { ...c, ...updates } : c
        ));

        try {
            const { error } = await supabase
                .from('candidates')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            toast.success('Candidate updated successfully');
        } catch (error: any) {
            toast.error('Failed to update candidate');
            // Revert on error
            loadCandidates();
        }
    };

    return {
        candidates,
        loading,
        selectedCandidates,
        setSelectedCandidates,
        toggleSelect,
        handleDelete,
        refreshCandidates: loadCandidates,
        updateStatus,
        updateCandidate
    };
}
