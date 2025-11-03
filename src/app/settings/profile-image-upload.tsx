
'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, type User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from 'axios';

interface ProfileImageUploadProps {
  user: User;
}

export function ProfileImageUpload({ user }: ProfileImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const handleUpdateProfilePicture = async (url: string | null) => {
      if (!user || !auth?.currentUser || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication error.' });
        return;
      }
       try {
            await updateProfile(auth.currentUser, { photoURL: url });
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL: url });

            toast({ title: 'Profile Picture Updated', description: 'Your new picture has been saved.' });
            window.location.reload();
        } catch (err: any) {
            console.error('Update profile picture error:', err);
            toast({ variant: 'destructive', title: 'Update Failed', description: err.message });
        }
  }

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

      try {
        // Step 1: Get Cloudinary upload signature from our secure API route
        const { data: signatureData } = await axios.get('/api/get-upload-signature');

        // Step 2: Upload file directly to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);
        formData.append('upload_preset', signatureData.uploadPreset);

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
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
        
        // Step 3: Update user's profile picture URL in Firebase
        await handleUpdateProfilePicture(secureUrl);

      } catch (err: any) {
        console.error('Upload error:', err);
        const errorMessage = err.response?.data?.error?.message || err.message || 'Upload failed. Please try again.';
        setError(errorMessage);
        toast({ variant: 'destructive', title: 'Upload Failed', description: errorMessage });
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [user, firestore, toast, handleUpdateProfilePicture]
  );
  
  const handleRemovePicture = async () => {
    await handleUpdateProfilePicture(null);
  }

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
    uploading ? 'cursor-not-allowed' : 'cursor-pointer'
  );

  return (
    <div className="flex items-center gap-6">
        <div className="relative group">
            <Avatar className="h-24 w-24 border">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => inputRef.current?.click()}>
                    <Edit className="h-5 w-5" />
                </Button>
                {user.photoURL && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive-foreground hover:bg-destructive/80">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove your current profile picture. You can upload a new one later.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRemovePicture}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
        <div 
            className={containerClasses}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
        >
            {uploading ? (
                 <div className="flex flex-col items-center space-y-2">
                    <p className="text-sm font-medium">Uploading...</p>
                    <Progress value={progress} className="w-full max-w-xs" />
                    <p className="text-xs text-muted-foreground">{progress}%</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center space-y-2 text-destructive">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-sm font-semibold">Upload Failed</p>
                    <Button onClick={(e) => {e.stopPropagation(); setError(null)}} variant="outline" size="sm">Try Again</Button>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-2">
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
            )}
             <input 
                ref={inputRef} 
                type="file" 
                accept="image/png, image/jpeg, image/gif" 
                className="hidden" 
                onChange={onInputChange} 
                disabled={uploading}
            />
        </div>
    </div>
  );
}
