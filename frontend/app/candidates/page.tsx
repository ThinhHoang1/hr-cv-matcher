'use client';

import { useState } from 'react';
import { Search, Mail, Phone, Briefcase, User, Trash2, FileText, X, LayoutGrid, List as ListIcon, Filter, Pencil } from 'lucide-react';
import Navbar from '@/src/frontend/components/Navbar';
import SkillBadge from '@/src/frontend/components/SkillBadge';
import LoadingSpinner from '@/src/frontend/components/LoadingSpinner';
import InviteModal from '@/src/frontend/components/InviteModal';
import KanbanBoard from '@/src/frontend/components/KanbanBoard';
import QuestionModal from '@/src/frontend/components/QuestionModal';
import EditCandidateModal from '@/src/frontend/components/EditCandidateModal';
import { getAvatarUrl, formatRelativeTime } from '@/src/shared/utils';
import Image from 'next/image';
import { useCandidates } from '@/src/frontend/hooks/useCandidates';
import { useInvite } from '@/src/frontend/hooks/useInvite';
import { Candidate } from '@/src/shared/types';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['All', 'Technology', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

export default function CandidatesPage() {
    // Custom Hooks
    const {
        candidates,
        loading,
        selectedCandidates,
        setSelectedCandidates,
        toggleSelect,
        handleDelete,
        updateStatus,
        updateCandidate
    } = useCandidates();

    const {
        isInviteModalOpen,
        setIsInviteModalOpen,
        inviteData,
        setInviteData,
        openInviteModal,
        handleSendInvites,
        isSending
    } = useInvite();

    // Local UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'new' | 'contacted'>('new');
    const [viewingCvUrl, setViewingCvUrl] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

    // Question Generation State
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);

    // Filter Logic
    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase());

        const isContacted = ['interviewing', 'hired', 'rejected', 'invited', 'offer', 'screening'].includes(c.status || '');

        const matchesDepartment = selectedDepartment === 'All' || (c.department || 'Technology') === selectedDepartment;

        // In Board view, we show all statuses (columns handle filtering)
        // In List view, we keep the tab logic
        if (viewMode === 'board') {
            return matchesSearch && matchesDepartment;
        }

        if (activeTab === 'new') return matchesSearch && !isContacted && matchesDepartment;
        return matchesSearch && isContacted && matchesDepartment;
    });

    const onSendInvites = () => {
        const selectedIds = Array.from(selectedCandidates);
        const emails = candidates
            .filter(c => selectedCandidates.has(c.id))
            .map(c => c.email);

        handleSendInvites(emails, async () => {
            // Optimistically update status for all selected candidates
            for (const id of selectedIds) {
                await updateStatus(id, 'invited');
            }
            setSelectedCandidates(new Set());
            toast.success('Candidates moved to Contacted');
        });
    };

    const handleEdit = (candidate: Candidate) => {
        setEditingCandidate(candidate);
        setIsEditModalOpen(true);
    };

    const handleGenerateQuestions = async (candidate: Candidate) => {
        setCurrentCandidate(candidate);
        setIsQuestionModalOpen(true);
        setQuestions([]);
        setIsGeneratingQuestions(true);

        try {
            const response = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: candidate.id })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setQuestions(data.questions);
        } catch (error: any) {
            toast.error('Failed to generate questions: ' + error.message);
            setIsQuestionModalOpen(false);
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                            Talent Pool
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">
                            Manage your recruitment pipeline
                        </p>
                    </div>

                    <div className="flex gap-3 items-center">
                        {/* View Toggle */}
                        <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="List View"
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Kanban Board"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>

                        {selectedCandidates.size > 0 && (
                            <>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-medium shadow-sm hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-200 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete ({selectedCandidates.size})
                                </button>
                                <button
                                    onClick={() => openInviteModal(selectedCandidates.size > 0)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-200 text-sm"
                                >
                                    <Mail className="w-4 h-4" />
                                    Send Invites ({selectedCandidates.size})
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-20 z-10">
                    {/* Department Filter */}
                    <div className="relative min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="block w-full pl-10 pr-10 py-2.5 text-sm border-gray-200 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm appearance-none bg-white cursor-pointer hover:border-blue-300 transition-colors"
                        >
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabs (Only for List View) */}
                    {viewMode === 'list' && (
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex-shrink-0 flex">
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'new'
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                New Candidates
                            </button>
                            <button
                                onClick={() => setActiveTab('contacted')}
                                className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'contacted'
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Contacted
                            </button>
                        </div>
                    )}

                    {/* Search */}
                    <div className="flex-1 bg-white/80 backdrop-blur-xl p-1 rounded-xl shadow-sm border border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-1.5 bg-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400 text-gray-700 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {viewMode === 'board' ? (
                    <KanbanBoard
                        candidates={filteredCandidates}
                        onStatusChange={updateStatus}
                        onGenerateQuestions={handleGenerateQuestions}
                    />
                ) : (
                    <div className="grid gap-4">
                        {/* Select All Header */}
                        {filteredCandidates.length > 0 && (
                            <div className="flex items-center gap-4 px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCandidates(new Set(filteredCandidates.map(c => c.id)));
                                        } else {
                                            setSelectedCandidates(new Set());
                                        }
                                    }}
                                    className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-600">
                                    {selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0
                                        ? `All ${filteredCandidates.length} candidates selected`
                                        : selectedCandidates.size > 0
                                            ? `${selectedCandidates.size} of ${filteredCandidates.length} selected`
                                            : `Select all ${filteredCandidates.length} candidates`
                                    }
                                </span>
                                {selectedCandidates.size > 0 && selectedCandidates.size < filteredCandidates.length && (
                                    <button
                                        onClick={() => setSelectedCandidates(new Set(filteredCandidates.map(c => c.id)))}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Select all
                                    </button>
                                )}
                            </div>
                        )}
                        {filteredCandidates.map(candidate => (
                            <div
                                key={candidate.id}
                                className={`group relative bg-white rounded-2xl p-5 border transition-all duration-300 ${selectedCandidates.has(candidate.id)
                                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500 bg-blue-50/30'
                                    : 'border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row gap-5">
                                    {/* Checkbox & Avatar */}
                                    <div className="flex items-start gap-4">
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedCandidates.has(candidate.id)}
                                                onChange={() => toggleSelect(candidate.id)}
                                                className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 cursor-pointer transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-gray-100 shadow-sm">
                                                <Image
                                                    src={candidate.avatar_url || getAvatarUrl(candidate.name)}
                                                    alt={candidate.name}
                                                    width={56}
                                                    height={56}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${candidate.status === 'hired' ? 'bg-green-500' :
                                                candidate.status === 'rejected' ? 'bg-red-500' :
                                                    candidate.status === 'interviewing' ? 'bg-purple-500' :
                                                        'bg-blue-500'
                                                }`}></div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                    {candidate.name}
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-normal">
                                                        {candidate.department || 'Technology'}
                                                    </span>
                                                    {candidate.cv_file_url && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setViewingCvUrl(candidate.cv_file_url);
                                                            }}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-lg"
                                                            title="View CV"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(candidate);
                                                        }}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-lg"
                                                        title="Edit Candidate"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {candidate.email}
                                                    </div>
                                                    {candidate.phone && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {candidate.phone}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {candidate.experience_years} years exp
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                {formatRelativeTime(candidate.created_at)}
                                            </div>
                                        </div>

                                        {candidate.summary && (
                                            <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2 group-hover:line-clamp-none transition-all">
                                                {candidate.summary}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2">
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
                )}

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mt-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search terms or upload more CVs.</p>
                    </div>
                )}
            </div>

            {/* Invite Modal Component */}
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                inviteData={inviteData}
                setInviteData={setInviteData}
                selectedCandidates={candidates.filter(c => selectedCandidates.has(c.id))}
                onSend={onSendInvites}
                isSending={isSending}
            />

            {/* Edit Candidate Modal */}
            <EditCandidateModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                candidate={editingCandidate}
                onSave={updateCandidate}
            />

            {/* Question Modal */}
            <QuestionModal
                isOpen={isQuestionModalOpen}
                onClose={() => setIsQuestionModalOpen(false)}
                questions={questions}
                candidateName={currentCandidate?.name || ''}
                isLoading={isGeneratingQuestions}
            />

            {/* PDF Viewer Modal */}
            {viewingCvUrl && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingCvUrl(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col relative shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-50 p-2 rounded-lg">
                                    <FileText className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">CV Viewer</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={viewingCvUrl}
                                    download
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    Download
                                </a>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <button
                                    onClick={() => setViewingCvUrl(null)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-medium text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 relative">
                            <iframe
                                src={viewingCvUrl}
                                className="w-full h-full border-none"
                                title="CV Viewer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
