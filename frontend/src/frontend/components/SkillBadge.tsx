'use client';

import { getSkillColor } from '@/src/shared/utils';

interface SkillBadgeProps {
    name: string;
    category?: string;
    proficiency?: string;
}

export default function SkillBadge({ name, category, proficiency }: SkillBadgeProps) {
    return (
        <span className={`badge ${getSkillColor(category)} hover:scale-105 transition-transform cursor-default`}>
            {name}
            {proficiency && (
                <span className="ml-1 opacity-70 text-xs">
                    • {proficiency}
                </span>
            )}
        </span>
    );
}
