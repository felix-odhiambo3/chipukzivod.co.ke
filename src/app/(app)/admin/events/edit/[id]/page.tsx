'use client';
import { EventForm } from '../../event-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Event } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const eventRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'events', params.id);
  }, [firestore, params.id]);

  const { data: event, isLoading } = useDoc<Event>(eventRef);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Edit Event</h1>
        <p className="text-muted-foreground">
          Modify the details of the event below.
        </p>
      </div>
      {isLoading && (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2"/>
            <Skeleton className="h-20 w-full"/>
            <Skeleton className="h-10 w-full"/>
            <Skeleton className="h-10 w-full"/>
            <div className="flex justify-end">
                <Skeleton className="h-10 w-24"/>
            </div>
        </div>
      )}
      {!isLoading && event && (
        <EventForm event={event} />
      )}
      {!isLoading && !event && <p>Event not found.</p>}
    </div>
  );
}
