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
import { useFirestore } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  service?: Service & { id: string };
}

export function ServiceForm({ service }: ServiceFormProps) {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<ServiceFormValues> = service ? { ...service } : {};

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: ServiceFormValues) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database.' });
        return;
    }
    
    const serviceData = {
        ...values,
        updatedAt: serverTimestamp(),
    };

    try {
        if (service) {
            const serviceRef = doc(firestore, 'services', service.id);
            setDocumentNonBlocking(serviceRef, { ...serviceData, createdAt: service.createdAt }, { merge: true });
            toast({ title: 'Service Updated', description: 'The service has been successfully updated.' });
        } else {
            const collectionRef = collection(firestore, 'services');
            addDocumentNonBlocking(collectionRef, { ...serviceData, createdAt: serverTimestamp() });
            toast({ title: 'Service Created', description: 'The new service has been successfully created.' });
        }
        router.push('/admin/services');
        router.refresh();
    } catch (error) {
        console.error("Error saving service:", error);
        toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not save the service. Please try again.' });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Professional Video Production" {...field} />
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
                    <Textarea placeholder="Describe the service..." {...field} rows={5}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>Link to a representative image for the service.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (service ? 'Update Service' : 'Create Service')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
