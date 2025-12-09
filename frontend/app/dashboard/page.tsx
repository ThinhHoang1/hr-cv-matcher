'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, Mail, TrendingUp, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import Navbar from '@/src/frontend/components/Navbar';
import StatsCard from '@/src/frontend/components/StatsCard';
import { supabase } from '@/src/lib/supabase-client';
import LoadingSpinner from '@/src/frontend/components/LoadingSpinner';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        interviewing: 0,
        hired: 0,
        rejected: 0,
        invitesSent: 0
    });
    const [skillData, setSkillData] = useState<any[]>([]);
    const [expData, setExpData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [recentInvites, setRecentInvites] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            // 1. Fetch Candidates Basic Stats
            const { data: candidates, error } = await supabase
                .from('candidates')
                .select('status, experience_years, created_at');

            if (error) throw error;

            const total = candidates.length;
            const newCount = candidates.filter(c => c.status === 'new').length;
            const interviewing = candidates.filter(c => c.status === 'interviewing').length;
            const hired = candidates.filter(c => c.status === 'hired').length;
            const rejected = candidates.filter(c => c.status === 'rejected').length;

            // 2. Fetch Invites Count & Recent List
            const { data: invites, count: invitesCount } = await supabase
                .from('invitations')
                .select('*, candidates(name, email, avatar_url)', { count: 'exact' })
                .order('sent_at', { ascending: false })
                .limit(5);

            setRecentInvites(invites || []);

            setStats({
                total,
                new: newCount,
                interviewing,
                hired,
                rejected,
                invitesSent: invitesCount || 0
            });

            // 3. Process Status Data for Pie Chart
            setStatusData([
                { name: 'New', value: newCount },
                { name: 'Interviewing', value: interviewing },
                { name: 'Hired', value: hired },
                { name: 'Rejected', value: rejected },
            ].filter(item => item.value > 0));

            // 4. Process Experience Data for Bar Chart
            const expBuckets = { '0-2 Years': 0, '3-5 Years': 0, '5-8 Years': 0, '8+ Years': 0 };
            candidates.forEach(c => {
                const exp = c.experience_years || 0;
                if (exp <= 2) expBuckets['0-2 Years']++;
                else if (exp <= 5) expBuckets['3-5 Years']++;
                else if (exp <= 8) expBuckets['5-8 Years']++;
                else expBuckets['8+ Years']++;
            });
            setExpData(Object.entries(expBuckets).map(([name, value]) => ({ name, value })));

            // 5. Fetch Top Skills
            const { data: skillsData } = await supabase
                .from('candidate_skills')
                .select('skill:skills(name)');

            if (skillsData) {
                const skillCounts: Record<string, number> = {};
                skillsData.forEach((item: any) => {
                    const skillName = item.skill?.name;
                    if (skillName) {
                        skillCounts[skillName] = (skillCounts[skillName] || 0) + 1;
                    }
                });

                // Sort and take top 5
                const topSkills = Object.entries(skillCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, value]) => ({ name, value }));

                setSkillData(topSkills);
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Recruitment Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of your candidate pipeline and performance.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Candidates"
                        value={stats.total}
                        icon={Users}
                        trend="+12% from last month"
                    />
                    <StatsCard
                        title="Interviews Sent"
                        value={stats.invitesSent}
                        icon={Mail}
                        trend="Active outreach"
                    />
                    <StatsCard
                        title="Hired Candidates"
                        value={stats.hired}
                        icon={CheckCircle}
                        trend="Goal: 5 this month"
                    />
                    <StatsCard
                        title="New Applications"
                        value={stats.new}
                        icon={Clock}
                        trend="Needs review"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                    {/* Status Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Pipeline Status</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Experience Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Experience Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Invitations Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Recent Invitations Sent</h3>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent At</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentInvites.length > 0 ? (
                                    recentInvites.map((invite) => (
                                        <tr key={invite.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                            {invite.candidates?.name?.charAt(0) || 'U'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{invite.candidates?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{invite.candidates?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(invite.sent_at).toLocaleDateString()}
                                                    <span className="text-gray-400 mx-1">•</span>
                                                    {new Date(invite.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Sent
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No invitations sent yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Skills Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Skills in Talent Pool</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={skillData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
