'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/src/shared/utils';
import { supabase } from '@/src/lib/supabase-client';
import {
    LayoutDashboard,
    Users,
    Search,
    Upload,
    Sparkles,
    Settings,
    LogOut,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload CVs', href: '/upload', icon: Upload },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'AI Search', href: '/search', icon: Search },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out');
        router.push('/login');
    };

    return (
        <nav className="glass-card sticky top-4 mx-4 z-50 mb-6">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center space-x-3 group">
                        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">HR CV Matcher</h1>
                            <p className="text-xs text-gray-500">AI-Powered Recruitment</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Recruiter Profile"
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
                                <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {user.email?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link href="/login">
                                <button className="px-5 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
                                    Sign In
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden mt-4 flex justify-around border-t border-gray-200 pt-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors',
                                    isActive
                                        ? 'text-primary-600'
                                        : 'text-gray-500 hover:text-primary-600'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
