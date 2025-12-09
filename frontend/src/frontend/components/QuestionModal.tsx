import { X, Copy, Check, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Question {
    type: string;
    question: string;
}

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: Question[];
    candidateName: string;
    isLoading: boolean;
}

export default function QuestionModal({ isOpen, onClose, questions, candidateName, isLoading }: QuestionModalProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                            <Lightbulb className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Interview Questions
                            <span className="block text-sm font-normal text-gray-500 mt-0.5">
                                for {candidateName}
                            </span>
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50/50">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600 font-medium text-lg">Generating Questions...</p>
                            <p className="text-sm text-gray-400 mt-2 max-w-xs">
                                Analyzing CV, skills, and experience to create tailored interview questions.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.length > 0 ? (
                                questions.map((q, index) => (
                                    <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 ${q.type === 'Technical' ? 'bg-blue-100 text-blue-700' :
                                                        q.type === 'Behavioral' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-green-100 text-green-700'
                                                    }`}>
                                                    {q.type}
                                                </span>
                                                <p className="text-gray-800 font-medium leading-relaxed text-lg">
                                                    {q.question}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(q.question, index)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Copy question"
                                            >
                                                {copiedIndex === index ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No questions generated. Please try again.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors shadow-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
