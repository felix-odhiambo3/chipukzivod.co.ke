'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useStorage, useUser } from '@/firebase';
import { uploadFileToStorage } from '@/firebase/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UploadDropzoneProps {
  uploadCollection: string;
  onUploadSuccess?: (result: { url: string; docPath: string }) => void;
}

export function UploadDropzone({ uploadCollection, onUploadSuccess }: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const storage = useStorage();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated or database not available.' });
        return;
      }

      setUploading(true);
      setError(null);
      setProgress(0);

      // Create a preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview({ type: 'image', url });
      } else {
        setPreview(null);
      }

      try {
        const { url, path } = await uploadFileToStorage(storage, file, user.uid, setProgress);
        
        const galleryCol = collection(firestore, 'gallery');
        await addDoc(galleryCol, {
            url,
            path,
            title: file.name,
            caption: '',
            type: file.type.startsWith('image/') ? 'image' : 'video',
            createdByAdminId: user.uid,
            viewCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        toast({ title: 'Upload Successful', description: `${file.name} has been uploaded.` });
        if (onUploadSuccess) {
          onUploadSuccess({ url, docPath: `gallery/${path}` });
        }
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || 'Upload failed. Please try again.');
        toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
      } finally {
        setUploading(false);
        setProgress(0);
        if (preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
        setPreview(null);
      }
    },
    [storage, user, onUploadSuccess, toast, firestore, preview]
  );

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file || null);
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file || null);
  }, [handleFile]);

  const cardBorderColor = dragOver ? 'border-primary' : error ? 'border-destructive' : 'border-dashed';

  return (
    <Card
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn("transition-colors", cardBorderColor)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {uploading ? (
            <>
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </>
          ) : error ? (
            <>
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="font-semibold text-destructive">Upload Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                 <Button onClick={() => setError(null)} variant="outline">Try Again</Button>
            </>
          ) : preview ? (
            <div className="relative">
                <Image src={preview.url} alt="Image preview" width={240} height={160} className="max-h-40 w-auto rounded-md object-contain" />
            </div>
          ) : (
            <>
              <div className="bg-muted/50 p-4 rounded-full border border-dashed">
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => inputRef.current?.click()}>
                  Click to upload
                </span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">Images and videos accepted</p>
            </>
          )}

          <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onInputChange} disabled={uploading}/>
        </div>
      </CardContent>
    </Card>
  );
}
