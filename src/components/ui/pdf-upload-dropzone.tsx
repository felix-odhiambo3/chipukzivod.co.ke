'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useStorage, useUser } from '@/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!storage || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated or storage not available.' });
        return;
      }

      if (file.type !== 'application/pdf') {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a PDF file.' });
        return;
      }

      setUploading(true);
      onUploadStateChange(true);
      setError(null);
      setProgress(0);
      setUploadedUrl(null);
      
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `resources/${user.uid}/${timestamp}_${safeName}`;
      const ref = storageRef(storage, path);

      const uploadTask = uploadBytesResumable(ref, file, { contentType: 'application/pdf' });

      uploadTask.on('state_changed', 
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(pct));
        },
        (err) => {
          console.error('Upload error:', err);
          setError(err.message);
          toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
          setUploading(false);
          onUploadStateChange(false);
          setProgress(0);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadedUrl(downloadURL);
            onUploadSuccess(downloadURL);
            toast({ title: 'Upload Successful', description: `${file.name} has been uploaded.` });
          } catch(err: any) {
            console.error('Get Download URL error:', err);
            setError(err.message);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not get download URL.' });
          } finally {
            setUploading(false);
            onUploadStateChange(false);
            setProgress(0);
          }
        }
      );
    },
    [onUploadSuccess, onUploadStateChange, toast, storage, user]
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
    uploading ? 'cursor-not-allowed' : 'cursor-pointer',
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
