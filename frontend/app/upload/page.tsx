'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import Navbar from '@/src/frontend/components/Navbar';
import { UploadProgress } from '@/src/shared/types';
import { formatFileSize } from '@/src/shared/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase-client';

export default function UploadPage() {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        multiple: true,
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error('Please login to upload');
            router.push('/login');
            return;
        }

        setIsUploading(true);
        // Initialize progress
        setUploadProgress(files.map(f => ({ file: f.name, progress: 0, status: 'uploading' })));

        let successCount = 0;

        // Process files in parallel
        const uploadPromises = files.map(async (file, index) => {
            try {
                // 1. Upload to Supabase Storage (Client-side Direct Upload)
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('cvs')
                    .upload(fileName, file, {
                        upsert: false,
                    });

                if (uploadError) throw uploadError;

                // Update progress to processing
                setUploadProgress(prev => prev.map((p, i) =>
                    i === index ? { ...p, progress: 50, status: 'processing' } : p
                ));

                // 2. Call Backend to Process the uploaded file
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                const response = await fetch('/api/process-cv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        filePath: fileName,
                        userId: user.id
                    }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Processing failed');
                }

                // Success
                successCount++;
                setUploadProgress(prev => prev.map((p, i) =>
                    i === index ? { ...p, progress: 100, status: 'completed' } : p
                ));

            } catch (error: any) {
                console.error(`Error uploading/processing ${file.name}:`, error);
                setUploadProgress(prev => prev.map((p, i) =>
                    i === index ? { ...p, status: 'error', error: error.message } : p
                ));
            }
        });

        await Promise.all(uploadPromises);

        setIsUploading(false);

        if (successCount > 0) {
            toast.success(`Successfully processed ${successCount}/${files.length} files`);
            // Clear files after a delay or let user see the checkmarks
            setTimeout(() => {
                router.push('/candidates');
            }, 2000);
        } else {
            toast.error('Failed to process files');
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">Upload CVs</h1>
                <p className="text-gray-600 mb-8">Upload multiple CV files for AI processing</p>

                <div {...getRootProps()} className={`glass-card p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary-500 bg-primary-50' : ''}`}>
                    <input {...getInputProps()} />
                    <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Drop CV files here</h3>
                    <p className="text-gray-600">or click to browse (PDF, DOCX)</p>
                </div>

                {files.length > 0 && (
                    <div className="glass-card p-6 mt-6">
                        <h3 className="font-bold mb-4">Selected Files ({files.length})</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <File className="w-5 h-5 text-primary-600" />
                                        <div><p className="font-medium">{file.name}</p><p className="text-sm text-gray-500">{formatFileSize(file.size)}</p></div>
                                    </div>
                                    <button onClick={() => removeFile(i)} className="text-red-500 hover:bg-red-50 p-2 rounded"><XCircle className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleUpload} disabled={isUploading} className="btn-primary w-full mt-4 disabled:opacity-50">
                            {isUploading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : `Upload ${files.length} Files`}
                        </button>
                    </div>
                )}

                {uploadProgress.length > 0 && (
                    <div className="glass-card p-6 mt-6">
                        <h3 className="font-bold mb-4">Upload Progress</h3>
                        <div className="space-y-3">
                            {uploadProgress.map((item, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {item.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                    {item.status === 'uploading' && <Loader className="w-5 h-5 text-blue-500 animate-spin" />}
                                    {item.status === 'processing' && <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />}

                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.file}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.status === 'uploading' && 'Uploading...'}
                                            {item.status === 'processing' && 'AI Processing...'}
                                            {item.status === 'completed' && 'Done'}
                                            {item.status === 'error' && item.error}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
