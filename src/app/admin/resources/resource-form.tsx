
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Resource } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { PdfUploadDropzone } from '@/components/ui/pdf-upload-dropzone';
import { useState } from 'react';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  fileUrl: z.string().url('A file must be uploaded.'),
});

type ResourceFormValues = z.infer<typeof formSchema>;

interface ResourceFormProps {
  resource?: Resource & { id: string };
}

export function ResourceForm({ resource }: ResourceFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const defaultValues: Partial<ResourceFormValues> = resource ? { ...resource } : {
    title: '',
    description: '',
    fileUrl: ''
  };

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: ResourceFormValues) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication error. Please try again.' });
        return;
    }
    
    const resourceData = {
        ...values,
        createdByAdminId: user.uid,
        updatedAt: serverTimestamp(),
    };

    try {
        if (resource) {
            const resourceRef = doc(firestore, 'resources', resource.id);
            setDocumentNonBlocking(resourceRef, { ...resourceData, createdAt: resource.createdAt }, { merge: true });
            toast({ title: 'Resource Updated', description: 'The resource has been successfully updated.' });
        } else {
            const collectionRef = collection(firestore, 'resources');
            addDocumentNonBlocking(collectionRef, { ...resourceData, createdAt: serverTimestamp() });
            toast({ title: 'Resource Created', description: 'The new resource has been successfully created.' });
        }
        router.push('/admin/resources');
        router.refresh();
    } catch (error) {
        console.error("Error saving resource:", error);
        toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not save the resource. Please try again.' });
    }
  };

  const handleUploadSuccess = (url: string) => {
    form.setValue('fileUrl', url, { shouldValidate: true });
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Annual Financial Report 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief summary of what this document contains..." {...field} rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource File (PDF)</FormLabel>
                  <FormControl>
                    <PdfUploadDropzone
                      onUploadSuccess={handleUploadSuccess}
                      onUploadStateChange={setIsUploading}
                      initialUrl={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                {isUploading ? 'Waiting for upload...' : form.formState.isSubmitting ? 'Saving...' : (resource ? 'Update Resource' : 'Create Resource')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
