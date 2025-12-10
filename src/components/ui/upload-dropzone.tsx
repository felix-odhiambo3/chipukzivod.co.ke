
'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, AlertCircle, Video, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { Input } from './input';
import { Textarea } from './textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    caption: z.string().optional(),
});

interface UploadDropzoneProps {
  onUploadSuccess?: (result: { url: string; docPath: string }) => void;
}

export function UploadDropzone({ onUploadSuccess }: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', caption: '' },
  });

  const resetState = () => {
    setDragOver(false);
    setProgress(0);
    setUploading(false);
    setError(null);
    setFileToUpload(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    form.reset();
  };
  
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Only image and video files are accepted.',
        });
        return;
    }

    setFileToUpload(file);
    setPreviewUrl(URL.createObjectURL(file));
    form.setValue('title', file.name.replace(/\.[^/.]+$/, ""));
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!fileToUpload) return;

    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated or database not available.' });
      return;
    }
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const errorMsg = 'Cloudinary environment variables are not properly configured.';
      setError(errorMsg);
      toast({ variant: 'destructive', title: 'Configuration Error', description: errorMsg });
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
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
      const publicId = uploadRes.data.public_id;
      
      const docRef = await addDoc(collection(firestore, 'gallery'), {
          url: secureUrl,
          path: publicId,
          title: values.title,
          caption: values.caption || '',
          type: fileToUpload.type.startsWith('image/') ? 'image' : 'video',
          status: 'published', // Default to published
          createdByAdminId: user.uid,
          viewCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      });

      toast({ title: 'Upload Successful', description: `${fileToUpload.name} has been uploaded.` });
      onUploadSuccess?.({ url: secureUrl, docPath: docRef.path });
      resetState();
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Upload Failed', description: errorMessage });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const cardBorderColor = dragOver ? 'border-primary' : error ? 'border-destructive' : 'border-dashed';
  const isImage = fileToUpload?.type.startsWith('image/');
  const isVideo = fileToUpload?.type.startsWith('video/');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Media</CardTitle>
      </CardHeader>
      <CardContent>
        {!fileToUpload ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn("transition-colors p-6 flex flex-col items-center justify-center text-center space-y-4 border-2 rounded-lg cursor-pointer hover:border-primary", cardBorderColor)}
          >
            <div className="bg-muted/50 p-4 rounded-full border border-dashed">
              <UploadCloud className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">Images and videos accepted</p>
            <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onInputChange} disabled={uploading} />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                {isImage && previewUrl && <Image src={previewUrl} alt="Preview" fill className="object-contain" />}
                {isVideo && <div className="flex items-center justify-center h-full"><Video className="w-16 h-16 text-muted-foreground" /></div>}
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={resetState}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Media title..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="A brief description..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {uploading && <Progress value={progress} className="w-full" />}
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? `Uploading... ${progress}%` : 'Upload Media'}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
