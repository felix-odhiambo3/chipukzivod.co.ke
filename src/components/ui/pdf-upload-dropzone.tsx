
'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface PdfUploadDropzoneProps {
  onUploadSuccess: (url: string) => void;
  onUploadStateChange: (isUploading: boolean) => void;
  initialUrl?: string;
}

export function PdfUploadDropzone({ onUploadSuccess, onUploadStateChange, initialUrl }: PdfUploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl || null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;

      if (file.type !== 'application/pdf') {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a PDF file.' });
        return;
      }
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        const errorMsg = 'Cloudinary environment variables are not properly configured.';
        console.error(errorMsg);
        setError(errorMsg);
        toast({ variant: 'destructive', title: 'Configuration Error', description: errorMsg });
        return;
      }

      setUploading(true);
      onUploadStateChange(true);
      setError(null);
      setProgress(0);
      setUploadedUrl(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          formData,
          {
            onUploadProgress: (event) => {
              if (event.total) {
                setProgress(Math.round((event.loaded / event.total) * 100));
              }
            },
          }
        );

        const secureUrl = uploadRes.data.secure_url;
        setUploadedUrl(secureUrl);
        onUploadSuccess(secureUrl);
        toast({ title: 'Upload Successful', description: `${file.name} has been uploaded.` });

      } catch (err: any) {
        console.error('Upload error:', err);
        const errorMessage = err.response?.data?.error?.message || err.message || 'Upload failed. Please try again.';
        setError(errorMessage);
        toast({ variant: 'destructive', title: 'Upload Failed', description: errorMessage });
      } finally {
        setUploading(false);
        onUploadStateChange(false);
        setProgress(0);
      }
    },
    [onUploadSuccess, onUploadStateChange, toast]
  );

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file || null);
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file || null);
  }, [handleFile]);

  const containerClasses = cn(
    "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors",
    dragOver ? 'border-primary bg-primary/10' : 'border-border',
    uploading ? 'cursor-not-allowed' : 'border-border',
    error ? 'border-destructive' : 'border-border',
    uploadedUrl ? 'border-green-500' : 'border-border',
  );

  const renderContent = () => {
    if (uploading) {
        return (
            <div className="flex flex-col items-center space-y-2">
                <p className="text-sm font-medium">Uploading...</p>
                <Progress value={progress} className="w-full max-w-xs" />
                <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center space-y-2 text-destructive">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm font-semibold">Upload Failed</p>
                <Button onClick={(e) => {e.stopPropagation(); setError(null);}} variant="outline" size="sm">Try Again</Button>
            </div>
        );
    }
    
    if (uploadedUrl) {
         return (
            <div className="flex flex-col items-center space-y-2 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <p className="text-sm font-semibold">File Uploaded</p>
                 <Button onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} variant="link" size="sm">Replace file</Button>
            </div>
        );
    }

    return (
      <div className="flex flex-col items-center space-y-2">
          <UploadCloud className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-muted-foreground">PDF only (max 10MB)</p>
      </div>
    );
  }

  return (
    <div 
        className={containerClasses}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && !uploadedUrl && inputRef.current?.click()}
    >
        {renderContent()}
         <input 
            ref={inputRef} 
            type="file" 
            accept="application/pdf"
            className="hidden" 
            onChange={onInputChange} 
            disabled={uploading}
        />
    </div>
  );
}
