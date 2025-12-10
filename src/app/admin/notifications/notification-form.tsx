
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
import type { Notification } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  message: z.string().min(3, 'Message must be at least 3 characters long.'),
  link: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});

type NotificationFormValues = z.infer<typeof formSchema>;

interface NotificationFormProps {
  notification?: Notification & { id: string };
}

export function NotificationForm({ notification }: NotificationFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<NotificationFormValues> = notification ? { ...notification } : {};

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: NotificationFormValues) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication error. Please try again.' });
        return;
    }
    
    const notificationData: any = {
        ...values,
        updatedAt: serverTimestamp(),
    };

    if (!notificationData.link) {
      delete notificationData.link;
    }

    try {
        if (notification) {
            const notificationRef = doc(firestore, 'notifications', notification.id);
            setDocumentNonBlocking(notificationRef, { ...notificationData, createdAt: notification.createdAt, readBy: notification.readBy || [] }, { merge: true });
            toast({ title: 'Notification Updated', description: 'The notification has been successfully updated.' });
        } else {
            const collectionRef = collection(firestore, 'notifications');
            addDocumentNonBlocking(collectionRef, { ...notificationData, createdAt: serverTimestamp(), readBy: [] });
            toast({ title: 'Notification Sent', description: 'The new notification has been sent to all users.' });
        }
        router.push('/admin/notifications');
        router.refresh();
    } catch (error) {
        console.error("Error saving notification:", error);
        toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not save the notification. Please try again.' });
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
                    <Input placeholder="e.g., New Event Posted" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A new event 'Annual General Meeting' is open for RSVPs." {...field} rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="/events/some-event-id" {...field} />
                  </FormControl>
                  <FormDescription>
                    A relative path or full URL to navigate to when the notification is clicked.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Sending...' : (notification ? 'Update Notification' : 'Send Notification')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
