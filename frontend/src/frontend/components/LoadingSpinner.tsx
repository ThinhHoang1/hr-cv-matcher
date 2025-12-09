'use client';

import { cn } from '@/src/shared/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div
                className={cn(
                    'rounded-full border-t-primary-500 border-r-secondary-500 border-b-transparent border-l-transparent animate-spin',
                    sizeClasses[size]
                )}
            />
        </div>
    );
}
