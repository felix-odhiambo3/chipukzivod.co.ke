'use client';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import type { Event } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'events', params.id);
  }, [firestore, params.id]);

  const { data: event, isLoading } = useDoc<Event>(eventRef);

  if (isLoading) {
    return (
      <div className="container py-12 md:py-16">
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-12 md:py-16 text-center">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="text-muted-foreground mt-2">The event you are looking for does not exist or may have been removed.</p>
        <Button asChild className="mt-8">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const startDate = new Date(event.startDatetime);
  const endDate = new Date(event.endDatetime);

  return (
    <div className="bg-background">
        {/* Hero Image */}
        {event.imageUrl && (
            <div className="relative h-64 md:h-96">
                <Image src={event.imageUrl} alt={event.title} layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-black/40" />
            </div>
        )}

        <div className="container -mt-16 md:-mt-24 relative z-10 pb-16">
            <Card className="p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">
                            {event.title}
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold">Date & Time</h3>
                                <p className="text-muted-foreground">
                                    {startDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    <br/>
                                    {startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
                                </p>
                            </div>
                        </div>
                         {event.location && (
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Location</h3>
                                    <p className="text-muted-foreground">{event.location}</p>
                                </div>
                            </div>
                        )}
                        {event.organizer && (
                             <div className="flex items-start gap-3">
                                <User className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Organizer</h3>
                                    <p className="text-muted-foreground">{event.organizer}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 border-t pt-6 text-center">
                     <Button asChild size="lg">
                        <Link href="/events">See All Events</Link>
                    </Button>
                </div>
            </Card>
        </div>
    </div>
  );
}
