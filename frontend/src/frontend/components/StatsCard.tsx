'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/src/shared/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    className?: string;
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <div className={cn('bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md', className)}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
                    {trend && (
                        <p className="text-sm flex items-center gap-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                trend.includes('+') || trend.includes('Active') || trend.includes('Goal')
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                            )}>
                                {trend}
                            </span>
                        </p>
                    )}
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                    <Icon className="w-6 h-6 text-blue-600" />
                </div>
            </div>
        </div>
    );
}
