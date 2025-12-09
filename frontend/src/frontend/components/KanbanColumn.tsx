import { useDroppable } from '@dnd-kit/core';
import { Candidate } from '@/src/shared/types';
import KanbanCard from './KanbanCard';
import { cn } from '@/src/shared/utils';

interface KanbanColumnProps {
    id: string;
    title: string;
    candidates: Candidate[];
    color: string;
    onGenerateQuestions?: (candidate: Candidate) => void;
}

export default function KanbanColumn({ id, title, candidates, color, onGenerateQuestions }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px]">
            {/* Header */}
            <div className={cn("p-3 rounded-t-xl border-b-2 flex justify-between items-center bg-white", color)}>
                <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {candidates.length}
                </span>
            </div>

            {/* Drop Area */}
            <div
                ref={setNodeRef}
                className="flex-1 bg-gray-50/50 p-3 rounded-b-xl border border-t-0 border-gray-200 overflow-y-auto min-h-[500px]"
            >
                {candidates.map((candidate) => (
                    <KanbanCard
                        key={candidate.id}
                        candidate={candidate}
                        onGenerateQuestions={onGenerateQuestions}
                    />
                ))}
                {candidates.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs italic border-2 border-dashed border-gray-200 rounded-lg">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}
