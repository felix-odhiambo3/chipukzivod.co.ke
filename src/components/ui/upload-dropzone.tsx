'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import axios from 'axios';

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
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

      if (!cloudName || !uploadPreset || !apiKey) {
        const errorMsg = 'Cloudinary environment variables are not properly configured.';
        console.error(errorMsg);
        setError(errorMsg);
        toast({ variant: 'destructive', title: 'Configuration Error', description: errorMsg });
        return;
      }

      setUploading(true);
      setError(null);
      setProgress(0);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview({ type: 'image', url });
      } else {
        setPreview(null);
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('api_key', apiKey);

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
        const publicId = uploadRes.data.public_id;
        
        const galleryCol = collection(firestore, uploadCollection);
        const docRef = await addDoc(galleryCol, {
            url: secureUrl,
            path: publicId,
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
          onUploadSuccess({ url: secureUrl, docPath: docRef.path });
        }
      } catch (err: any) {
        console.error('Upload error:', err);
        const errorMessage = err.response?.data?.error?.message || err.message || 'Upload failed. Please try again.';
        setError(errorMessage);
        toast({ variant: 'destructive', title: 'Upload Failed', description: errorMessage });
      } finally {
        setUploading(false);
        setProgress(0);
        if (preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
        setPreview(null);
      }
    },
    [uploadCollection, onUploadSuccess, user, firestore, toast, preview]
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
