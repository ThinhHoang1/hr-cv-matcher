import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState } from 'react';
import { Candidate } from '@/src/shared/types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { createPortal } from 'react-dom';

interface KanbanBoardProps {
    candidates: Candidate[];
    onStatusChange: (candidateId: string, newStatus: string) => void;
    onGenerateQuestions?: (candidate: Candidate) => void;
}

const COLUMNS = [
    { id: 'new', title: 'New Candidates', color: 'border-blue-500' },
    { id: 'screening', title: 'Screening', color: 'border-yellow-500' },
    { id: 'interviewing', title: 'Interviewing', color: 'border-purple-500' },
    { id: 'offer', title: 'Offer Sent', color: 'border-pink-500' },
    { id: 'hired', title: 'Hired', color: 'border-green-500' },
    { id: 'rejected', title: 'Rejected', color: 'border-red-500' },
];

export default function KanbanBoard({ candidates, onStatusChange, onGenerateQuestions }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts (prevents accidental clicks)
            },
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // active.id is candidateId
            // over.id is the column id (status)
            onStatusChange(active.id as string, over.id as string);
        }

        setActiveId(null);
    };

    const activeCandidate = activeId ? candidates.find(c => c.id === activeId) : null;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        candidates={candidates.filter(c => (c.status || 'new') === col.id)}
                        onGenerateQuestions={onGenerateQuestions}
                    />
                ))}
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeCandidate ? (
                        <div className="transform rotate-3 cursor-grabbing w-[280px]">
                            <KanbanCard candidate={activeCandidate} />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
