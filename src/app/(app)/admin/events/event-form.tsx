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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  startDatetime: z.date({ required_error: 'A start date is required.' }),
  endDatetime: z.date({ required_error: 'An end date is required.' }),
  timezone: z.string().min(1, 'Timezone is required.'),
  eventType: z.string().min(1, 'Event type is required.'),
  location: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  organizer: z.string().min(1, 'Organizer is required.'),
  published: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  event?: Event & { id: string };
}

export function EventForm({ event }: EventFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<EventFormValues> = event ? {
      ...event,
      startDatetime: new Date(event.startDatetime),
      endDatetime: new Date(event.endDatetime),
  } : {
    published: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: EventFormValues) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database.' });
        return;
    }
    
    const eventData = {
        ...values,
        startDatetime: values.startDatetime.toISOString(),
        endDatetime: values.endDatetime.toISOString(),
        createdByAdminId: user.uid,
        updatedAt: serverTimestamp(),
    };

    try {
        if (event) {
            // Update existing event
            const eventRef = doc(firestore, 'events', event.id);
            setDocumentNonBlocking(eventRef, { ...eventData, createdAt: event.createdAt }, { merge: true });
            toast({ title: 'Event Updated', description: 'The event has been successfully updated.' });
        } else {
            // Create new event
            const collectionRef = collection(firestore, 'events');
            addDocumentNonBlocking(collectionRef, { ...eventData, createdAt: serverTimestamp() });
            toast({ title: 'Event Created', description: 'The new event has been successfully created.' });
        }
        router.push('/admin/events');
        router.refresh();
    } catch (error) {
        console.error("Error saving event:", error);
        toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not save the event. Please try again.' });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Annual General Meeting" {...field} />
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
                            <Textarea placeholder="Describe the event..." {...field} rows={5}/>
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
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormDescription>Link to a poster or event image. Use a service like Picsum for placeholders (e.g. https://picsum.photos/seed/event_image/600/400).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="startDatetime"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Start Date & Time</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP p")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                        {/* Simple time picker */}
                                        <div className="p-2 border-t">
                                            <Input type="time" defaultValue={format(field.value || new Date(), 'HH:mm')} onChange={e => {
                                                const [hours, minutes] = e.target.value.split(':');
                                                const newDate = new Date(field.value);
                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                field.onChange(newDate);
                                            }} />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDatetime"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>End Date & Time</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP p")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < (form.getValues('startDatetime') || new Date())}
                                            initialFocus
                                        />
                                         <div className="p-2 border-t">
                                            <Input type="time" defaultValue={format(field.value || new Date(), 'HH:mm')} onChange={e => {
                                                const [hours, minutes] = e.target.value.split(':');
                                                const newDate = new Date(field.value);
                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                field.onChange(newDate);
                                            }} />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField control={form.control} name="timezone" render={({ field }) => (<FormItem><FormLabel>Timezone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="eventType" render={({ field }) => (<FormItem><FormLabel>Event Type</FormLabel><FormControl><Input placeholder="e.g. Workshop" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. CUK, Karen or Online" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="organizer" render={({ field }) => (<FormItem><FormLabel>Organizer</FormLabel><FormControl><Input placeholder="e.g. Chipukizi VOD" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish Event</FormLabel>
                    <FormDescription>
                    Make this event visible to the public on the events page.
                    </FormDescription>
                </div>
                <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    