
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Event } from '@/lib/data';
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useFirestore as useAppFirestore } from "@/firebase";

function EventCard({ event }: { event: Event & { id: string } }) {
  return (
    <Card key={event.id} className="overflow-hidden flex flex-col sm:flex-row">
      {event.imageUrl && 
        <div className="w-full sm:w-1/3 relative h-48 sm:h-auto">
          <Image src={event.imageUrl} alt={event.title} fill style={{objectFit: 'cover'}} data-ai-hint="event photo"/>
        </div>
      }
      <div className="w-full sm:w-2/3 flex flex-col">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            {new Date(event.startDatetime).toLocaleString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
        </CardContent>
        <CardContent>
          <Button asChild variant="link" className="px-0 mt-2">
            <Link href={`/events/${event.id}`}>Learn More <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

function EventsLoadingSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/3 relative h-48 sm:h-auto">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="w-full sm:w-2/3">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function PublicEventsPage() {
  const firestore = useAppFirestore();
  const [events, setEvents] = useState<(Event & { id: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
        if (!firestore) return;
      try {
        const q = query(
          collection(firestore, 'events'),
          where('status', '==', 'published')
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Event & { id: string }));
        
        // Sort events on the client side
        data.sort((a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime());
        
        setEvents(data);
      } catch (err: any) {
        console.error('Firestore read error:', err);
        setError(err.message || 'Unable to fetch events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [firestore]);

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Events</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Join our workshops, meetings, and community gatherings.
        </p>
      </div>

      {loading && <EventsLoadingSkeleton />}
      {!loading && error && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-red-500">
          ⚠️ {error.includes('Missing or insufficient permissions')
            ? 'Access denied. Please check your Firestore security rules.'
            : error}
        </div>
      )}
      {!loading && !error && (
        events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Upcoming Events</h3>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon for new events!</p>
          </div>
        )
      )}
    </div>
  );
}
