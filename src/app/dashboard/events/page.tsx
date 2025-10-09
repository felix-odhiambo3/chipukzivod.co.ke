
'use client';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Event } from '@/lib/data';
import { Skeleton } from "@/components/ui/skeleton";

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
          <CardDescription>{new Date(event.startDatetime).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' })}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
        </CardContent>
        <CardContent>
          <Button asChild variant="link" className="px-0 mt-2">
            <Link href={`/dashboard/events/${event.id}`}>Learn More <ArrowRight className="ml-1 h-4 w-4" /></Link>
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

export default function EventsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const firestore = useFirestore();
  const now = new Date().toISOString();

  const upcomingEventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'events'), 
      where('status', '==', "published"),
      where('startDatetime', '>=', now),
      orderBy('startDatetime', 'asc')
    );
  }, [firestore, now]);

  const pastEventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'events'), 
      where('status', '==', "published"),
      where('startDatetime', '<', now),
      orderBy('startDatetime', 'desc')
    );
  }, [firestore, now]);

  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useCollection<Event>(upcomingEventsQuery);
  const { data: pastEvents, isLoading: isLoadingPast } = useCollection<Event>(pastEventsQuery);

  const isLoading = isLoadingUpcoming || isLoadingPast;

  const renderContent = () => {
    if (isLoading) {
      return <EventsLoadingSkeleton />;
    }
    
    return (
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Highlights</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
            <div className="space-y-6 mt-6">
              {upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Upcoming Events</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Check back soon for new events!</p>
                </div>
              )}
            </div>
        </TabsContent>
        <TabsContent value="past">
             <div className="space-y-6 mt-6">
              {pastEvents && pastEvents.length > 0 ? (
                pastEvents.map((event) => <EventCard key={event.id} event={event} />)
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No past events to show.</p>
                </div>
              )}
            </div>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-12">
        <h1 className="text-3xl font-bold font-headline">Events & Activities</h1>
        <p className="mt-2 text-muted-foreground">
          Join our workshops, meetings, and community gatherings.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {renderContent()}
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    
