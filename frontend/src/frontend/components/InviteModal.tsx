import { useState, useEffect } from 'react';
import { Trash2, Briefcase, Globe, Calendar, Clock, MapPin, Link as LinkIcon, User, Mail } from 'lucide-react';
import { InviteData } from '@/src/frontend/hooks/useInvite';
import { Candidate } from '@/src/shared/types';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    inviteData: InviteData;
    setInviteData: React.Dispatch<React.SetStateAction<InviteData>>;
    selectedCandidates: Candidate[];
    onSend: () => void;
    isSending: boolean;
}

const DEFAULT_EMAIL_TEMPLATE = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <h2 style="color: #2563eb;">Interview Invitation: {job_title}</h2>
  <p>Dear {name},</p>
  
  <p>Thank you for applying for the <strong>{job_title}</strong> position with us.</p>
  
  <p>After carefully reviewing your profile, we are very impressed with your skills and work experience. We would like to invite you for an interview to discuss this opportunity further.</p>
  
  {custom_message}
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Interview Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>📅 Date:</strong></td>
        <td style="color: #0f172a;">{date}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;"><strong>⏰ Time:</strong></td>
        <td style="color: #0f172a;">{time}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;"><strong>📍 Venue:</strong></td>
        <td style="color: #0f172a;">{venue}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;"><strong>🗺️ Map:</strong></td>
        <td><a href="{map_link}" style="color: #2563eb; text-decoration: none;">View on Google Maps</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;"><strong>👤 Contact:</strong></td>
        <td style="color: #0f172a;">{contact_name} {contact_phone}</td>
      </tr>
    </table>
  </div>

  <p>Please confirm your availability by replying to this email.</p>
  
  <p>Best regards,<br><strong>{contact_name}</strong><br>Recruitment Team</p>
</div>`;

export default function InviteModal({
    isOpen,
    onClose,
    inviteData,
    setInviteData,
    selectedCandidates,
    onSend,
    isSending
}: InviteModalProps) {
    const [inviteStep, setInviteStep] = useState<'details' | 'preview'>('details');

    // Reset step when modal opens
    useEffect(() => {
        if (isOpen) setInviteStep('details');
    }, [isOpen]);

    const updateEmailPreview = () => {
        if (!inviteData.emailBody) {
            setInviteData(prev => ({
                ...prev,
                emailSubject: `Interview Invitation: ${prev.jobTitle || 'Position'}`,
                emailBody: DEFAULT_EMAIL_TEMPLATE
                    .replace('{custom_message}', prev.customMessage ? `<p>${prev.customMessage}</p>` : '')
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 animate-in zoom-in duration-200 my-8 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Send Interview Invitations</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <Trash2 className="w-5 h-5 rotate-45" />
                    </button>
                </div>

                <div className="flex gap-4 mb-6 border-b border-gray-100">
                    <button
                        onClick={() => setInviteStep('details')}
                        className={`pb-3 px-2 font-medium text-sm transition-colors relative ${inviteStep === 'details' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        1. Interview Details
                        {inviteStep === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => {
                            updateEmailPreview();
                            setInviteStep('preview');
                        }}
                        className={`pb-3 px-2 font-medium text-sm transition-colors relative ${inviteStep === 'preview' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        2. Customize Email
                        {inviteStep === 'preview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {inviteStep === 'details' ? (
                        <div className="space-y-6">
                            <p className="text-gray-500">
                                Sending emails to <span className="font-bold text-blue-600">{selectedCandidates.length} candidates</span>.
                            </p>

                            {/* Job & Time */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Senior React Developer"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={inviteData.jobTitle}
                                            onChange={e => setInviteData({ ...inviteData, jobTitle: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Language</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                            value={inviteData.language}
                                            onChange={e => setInviteData({ ...inviteData, language: e.target.value })}
                                        >
                                            <option>English</option>
                                            <option>Vietnamese</option>
                                            <option>Japanese</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={inviteData.interviewDate}
                                            onChange={e => setInviteData({ ...inviteData, interviewDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="time"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={inviteData.interviewTime}
                                            onChange={e => setInviteData({ ...inviteData, interviewTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Venue */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="123 Tech Street, City..."
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={inviteData.venue}
                                        onChange={e => setInviteData({ ...inviteData, venue: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Links & Contact */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Map Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="https://maps.google.com/..."
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={inviteData.mapLink}
                                            onChange={e => setInviteData({ ...inviteData, mapLink: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Ms. Nga (090...)"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={inviteData.contactName}
                                            onChange={e => setInviteData({ ...inviteData, contactName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Participants */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Participants (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Mr. Chang (CEO), Mr. Huyn (Lead)"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={inviteData.participants}
                                    onChange={e => setInviteData({ ...inviteData, participants: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100 mb-4">
                                <strong>💡 Tip:</strong> You can use placeholders like <code>{`{name}`}</code>, <code>{`{job_title}`}</code>, <code>{`{date}`}</code>, <code>{`{time}`}</code>, <code>{`{venue}`}</code> in your email template.
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    value={inviteData.emailSubject}
                                    onChange={e => setInviteData({ ...inviteData, emailSubject: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Content (HTML Supported)</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-64 font-mono text-sm"
                                    value={inviteData.emailBody}
                                    onChange={e => setInviteData({ ...inviteData, emailBody: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Live Preview (First Candidate)</label>
                                <div
                                    className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: inviteData.emailBody
                                            .replace(/{name}/g, selectedCandidates[0]?.name || 'Candidate Name')
                                            .replace(/{job_title}/g, inviteData.jobTitle || 'Job Position')
                                            .replace(/{date}/g, inviteData.interviewDate || 'TBD')
                                            .replace(/{time}/g, inviteData.interviewTime || 'TBD')
                                            .replace(/{venue}/g, inviteData.venue || 'TBD')
                                            .replace(/{contact_name}/g, inviteData.contactName || 'HR')
                                            .replace(/{contact_phone}/g, inviteData.contactPhone || '')
                                            .replace(/{map_link}/g, inviteData.mapLink || '#')
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex-1"></div>
                    {inviteStep === 'details' ? (
                        <button
                            onClick={() => {
                                updateEmailPreview();
                                setInviteStep('preview');
                            }}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                        >
                            Next: Preview Email
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setInviteStep('details')}
                                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                            >
                                Back
                            </button>
                            <button
                                onClick={onSend}
                                disabled={isSending}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSending ? 'Sending...' : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        Send {selectedCandidates.length} Emails
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
