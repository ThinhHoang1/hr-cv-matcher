import { X, Download, ExternalLink } from 'lucide-react';

interface CvViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    cvUrl: string | null;
    candidateName: string;
}

export default function CvViewerModal({ isOpen, onClose, cvUrl, candidateName }: CvViewerModalProps) {
    if (!isOpen || !cvUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            CV: <span className="text-blue-600">{candidateName}</span>
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <a
                            href={cvUrl}
                            download
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download PDF"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Open in New Tab"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 relative">
                    {/* We assume secure-cv returns a viewable file (PDF) or browser handles it */}
                    <iframe
                        src={`${cvUrl}#toolbar=0`}
                        className="w-full h-full"
                        title="CV Viewer"
                    />
                </div>
            </div>
        </div>
    );
}
