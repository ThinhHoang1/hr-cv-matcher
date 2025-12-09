'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase-client';
import Navbar from '@/src/frontend/components/Navbar';
import { Save, Building, MapPin, Phone, User, Link as LinkIcon, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/src/frontend/components/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const [profile, setProfile] = useState({
        company_name: '',
        address: '',
        google_map_link: '',
        contact_phone: '',
        contact_name: '',
        signature_name: '',
        signature_role: ''
    });

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }
        setUser(session.user);
        loadProfile(session.user.id);
    }

    async function loadProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('recruiters')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (data) {
                setProfile(data);
            } else if (error && error.code !== 'PGRST116') {
                console.error('Error loading profile:', error);
            }
        } catch (error) {
            console.error('Profile load error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('recruiters')
                .upsert({
                    user_id: user.id,
                    ...profile,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;
            toast.success('Profile saved successfully!');
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(`Failed to save: ${error.message}`);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold mb-2">Recruiter Profile</h1>
                        <p className="opacity-90">Set up your default information for interview invitations.</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Company Info */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-blue-600" />
                                Company Details
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={profile.company_name}
                                        onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Best HR Solution Co.,Ltd"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={profile.address}
                                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="1F - Pacific Building..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Map Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={profile.google_map_link}
                                            onChange={e => setProfile({ ...profile, google_map_link: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://maps.google.com/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* Contact Info */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-green-600" />
                                Contact Information
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={profile.contact_name}
                                            onChange={e => setProfile({ ...profile, contact_name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Ms. Nga Bui"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={profile.contact_phone}
                                            onChange={e => setProfile({ ...profile, contact_phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="028.3837.2127"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-gray-100"></div>

                        {/* Signature */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <PenTool className="w-5 h-5 text-purple-600" />
                                Email Signature
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Signature Name</label>
                                    <input
                                        type="text"
                                        value={profile.signature_name}
                                        onChange={e => setProfile({ ...profile, signature_name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ms. Nga Bui"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                                    <input
                                        type="text"
                                        value={profile.signature_role}
                                        onChange={e => setProfile({ ...profile, signature_role: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Recruitment Consultant"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {saving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
