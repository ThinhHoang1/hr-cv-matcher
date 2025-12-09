import Link from 'next/link';
import { ArrowRight, Sparkles, Upload, Search, Mail } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 font-medium mb-6 animate-fade-in">
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI-Powered Talent Acquisition Platform
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
                            Find Your Perfect
                            <br />
                            <span className="gradient-text">Candidate Faster</span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-slide-up">
                            Upload hundreds of CVs, leverage AI-powered RAG technology to match candidates with job descriptions, and send interview invitations automatically.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                            <Link href="/login" className="btn-primary inline-flex items-center justify-center">
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link href="/candidates" className="btn-secondary inline-flex items-center justify-center">
                                View Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything You Need for <span className="gradient-text">Modern Recruitment</span>
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Powered by Gemini AI and RAG technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card p-8 hover-lift">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                <Upload className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Bulk CV Upload</h3>
                            <p className="text-gray-600">
                                Upload hundreds of CVs in PDF or DOCX format. Our AI automatically extracts names, emails, skills, and experience.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-8 hover-lift">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                <Search className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">AI-Powered Matching</h3>
                            <p className="text-gray-600">
                                Enter a job description and let our RAG-based vector search find the most suitable candidates automatically.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8 hover-lift">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                <Mail className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Auto Interview Invites</h3>
                            <p className="text-gray-600">
                                Select candidates and send personalized interview invitations via email with one click through AI automation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-card p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Transform Your <span className="gradient-text">Hiring Process?</span>
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">
                            Join modern HR teams using AI to find the best talent faster.
                        </p>
                        <Link href="/login" className="btn-primary inline-flex items-center">
                            Start Free Trial
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
