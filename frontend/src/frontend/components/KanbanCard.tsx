import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Candidate } from '@/src/shared/types';
import { getAvatarUrl } from '@/src/shared/utils';
import Image from 'next/image';
import { Mail, Phone, Lightbulb } from 'lucide-react';

interface KanbanCardProps {
    candidate: Candidate;
    onGenerateQuestions?: (candidate: Candidate) => void;
}

export default function KanbanCard({ candidate, onGenerateQuestions }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: candidate.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="group relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-3"
        >
            {/* Action Button */}
            {onGenerateQuestions && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onGenerateQuestions(candidate);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title="Generate Interview Questions"
                >
                    <Lightbulb className="w-4 h-4" />
                </button>
            )}

            <div className="flex items-center gap-3 mb-3 pr-6">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                        src={candidate.avatar_url || getAvatarUrl(candidate.name)}
                        alt={candidate.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-sm">{candidate.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{candidate.experience_years} years exp</p>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                    <Mail className="w-3 h-3" />
                    {candidate.email}
                </div>
                {candidate.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                        <Phone className="w-3 h-3" />
                        {candidate.phone}
                    </div>
                )}
            </div>

            {candidate.skills && candidate.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 2).map((cs: any) => (
                        <span key={cs.id} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium">
                            {cs.skill?.name || 'Skill'}
                        </span>
                    ))}
                    {candidate.skills.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-md">
                            +{candidate.skills.length - 2}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
