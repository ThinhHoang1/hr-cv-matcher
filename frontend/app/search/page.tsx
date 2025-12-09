'use client';

import { useState } from 'react';
import CvViewerModal from '@/src/frontend/components/CvViewerModal';
import { Search, Sparkles, TrendingUp, FileText } from 'lucide-react';
import Navbar from '@/src/frontend/components/Navbar';
import SkillBadge from '@/src/frontend/components/SkillBadge';
import LoadingSpinner from '@/src/frontend/components/LoadingSpinner';
import { Candidate } from '@/src/shared/types';
import { getAvatarUrl } from '@/src/shared/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { supabase } from '@/src/lib/supabase-client';

interface SearchResultItem extends Candidate {
    match_score?: number;
    matching_skills?: string[];
    match_reason?: string;
    similarity_score?: number;
}

export default function SearchPage() {
    const [jobDescription, setJobDescription] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResultItem[]>([]);

    // CV Viewer State
    const [viewingCv, setViewingCv] = useState<string | null>(null);
    const [viewingName, setViewingName] = useState<string>('');

    const handleSearch = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        setIsSearching(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/search-candidates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: jobDescription,
                    limit: 20,
                    threshold: 0.5
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data.results || []);
                toast.success(`Found ${data.results?.length || 0} matching candidates`);
            } else {
                throw new Error('Search failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to search candidates');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ... Header and Search Box ... */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">AI-Powered Search</h1>
                    <p className="text-gray-600">Find the best candidates using RAG-based matching</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Job Description</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Enter the job description, requirements, and skills needed..."
                        className="w-full h-48 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none resize-none transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {isSearching ? (
                            <><LoadingSpinner size="sm" className="mr-2" /> Searching with AI...</>
                        ) : (
                            <><Sparkles className="w-5 h-5 mr-2" /> Find Best Candidates</>
                        )}
                    </button>
                </div>

                {results.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Search Results ({results.length})</h2>
                        <div className="grid gap-4">
                            {results.map((candidate) => (
                                <div key={candidate.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                                    <div className="flex items-start space-x-4">
                                        <Image
                                            src={candidate.avatar_url || getAvatarUrl(candidate.name)}
                                            alt={candidate.name}
                                            width={64}
                                            height={64}
                                            className="rounded-2xl"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                                                    <p className="text-gray-500 text-sm">{candidate.email}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {(candidate.similarity_score || 0) > 0 && (
                                                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center space-x-1 border border-green-100">
                                                            <TrendingUp className="w-4 h-4" />
                                                            <span className="font-bold text-sm">{Math.round((candidate.similarity_score || 0) * 100)}% Match</span>
                                                        </div>
                                                    )}

                                                    {candidate.cv_file_url && (
                                                        <button
                                                            onClick={() => {
                                                                setViewingCv(candidate.cv_file_url);
                                                                setViewingName(candidate.name);
                                                            }}
                                                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            <span>View CV</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* AI Insight Box */}
                                            {candidate.match_reason && (
                                                <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
                                                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                                                        {candidate.match_reason.replace('✨ ', '')}
                                                    </p>
                                                </div>
                                            )}

                                            {candidate.summary && !candidate.match_reason && (
                                                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{candidate.summary}</p>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {candidate.candidate_skills?.map((cs: any) => (
                                                    <SkillBadge
                                                        key={cs.id}
                                                        name={cs.skill?.name}
                                                        category={cs.skill?.category}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CV Viewer Modal */}
                <CvViewerModal
                    isOpen={!!viewingCv}
                    onClose={() => setViewingCv(null)}
                    cvUrl={viewingCv}
                    candidateName={viewingName}
                />

                {!isSearching && results.length === 0 && jobDescription && (
                    <div className="text-center py-12 glass-card">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No results yet. Try searching with a job description.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
