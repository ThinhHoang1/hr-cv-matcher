// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    experience_years: number;
    summary?: string;
    cv_file_url?: string;
    cv_file_name?: string;
    department?: string;
    status: string;
    created_at: string;
    updated_at: string;
    user_id?: string;
    metadata?: any;
    skills?: CandidateSkill[];
    candidate_skills?: CandidateSkill[];
}

export interface Skill {
    id: string;
    name: string;
    category?: string;
    created_at: string;
}

export interface CandidateSkill {
    id: string;
    candidate_id: string;
    skill_id: string;
    skill?: Skill;
    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_of_experience?: number;
    created_at: string;
}

export interface JobDescription {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    user_id?: string;
    created_at: string;
    updated_at: string;
}

export interface SearchResult {
    id: string;
    job_description_id: string;
    candidate_id: string;
    candidate?: Candidate;
    match_score: number;
    matching_skills?: any;
    created_at: string;
}

export interface Invitation {
    id: string;
    candidate_id: string;
    job_description_id?: string;
    sent_at: string;
    status: 'sent' | 'opened' | 'replied' | 'declined';
    user_id?: string;
}

// N8N Response Types
export interface N8NUploadResponse {
    success: boolean;
    processed: number;
    candidates: Array<{
        name: string;
        email: string;
        phone?: string;
        skills: string[];
        experience_years?: number;
        summary?: string;
    }>;
}

export interface N8NSearchResponse {
    success: boolean;
    results: Array<{
        candidate_id: string;
        score: number;
        matching_skills: string[];
    }>;
}

export interface N8NEmailResponse {
    success: boolean;
    sent: number;
    failed: number;
}

// UI Types
export interface UploadProgress {
    file: string;
    progress: number;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}

export interface FilterOptions {
    search?: string;
    skills?: string[];
    minExperience?: number;
    maxExperience?: number;
    status?: Candidate['status'];
}
