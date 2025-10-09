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
import type { Announcement } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  mediaUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});

type AnnouncementFormValues = z.infer<typeof formSchema>;

interface AnnouncementFormProps {
  announcement?: Announcement & { id: string };
}

export function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<AnnouncementFormValues> = announcement ? { ...announcement } : {};

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: AnnouncementFormValues) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication error. Please try again.' });
        return;
    }
    
    const announcementData = {
        ...values,
        createdByAdminId: user.uid,
        updatedAt: serverTimestamp(),
    };

    try {
        if (announcement) {
            const announcementRef = doc(firestore, 'announcements', announcement.id);
            setDocumentNonBlocking(announcementRef, { ...announcementData, createdAt: announcement.createdAt }, { merge: true });
            toast({ title: 'Announcement Updated', description: 'The announcement has been successfully updated.' });
        } else {
            const collectionRef = collection(firestore, 'announcements');
            addDocumentNonBlocking(collectionRef, { ...announcementData, createdAt: serverTimestamp() });
            toast({ title: 'Announcement Created', description: 'The new announcement has been successfully created.' });
        }
        router.push('/admin/announcements');
        router.refresh();
    } catch (error) {
        console.error("Error saving announcement:", error);
        toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not save the announcement. Please try again.' });
    }
  };

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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Upcoming Maintenance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Details about the announcement..." {...field} rows={8}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to an optional image or video for the announcement.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (announcement ? 'Update Announcement' : 'Create Announcement')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    