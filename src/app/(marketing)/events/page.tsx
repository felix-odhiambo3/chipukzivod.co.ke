'use client';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events as staticEvents } from "@/lib/data";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from 'react';

// In the future, this data will come from Firestore
const events = staticEvents.map(e => ({...e, date: new Date(e.date)}));

export default function EventsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const upcomingEvents = events.filter(e => e.date >= new Date());
  const pastEvents = events.filter(e => e.date < new Date());

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Events & Activities</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Join our workshops, meetings, and community gatherings.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Highlights</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <div className="space-y-6 mt-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <Card key={event.title} className="overflow-hidden flex flex-col sm:flex-row">
                      {event.image && event.image.imageUrl && 
                        <div className="w-full sm:w-1/3">
                          <Image src={event.image.imageUrl} alt={event.title} width={400} height={250} className="w-full h-full object-cover" data-ai-hint={event.image.imageHint}/>
                        </div>
                      }
                      <div className="w-full sm:w-2/3">
                        <CardHeader>
                          <CardTitle>{event.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{event.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                           <Button asChild variant="link" className="px-0 mt-2">
                            <Link href={`/events/${event.title.toLowerCase().replace(/ /g, '-')}`}>Learn More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No upcoming events. Check back soon!</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="past">
               <div className="space-y-6 mt-6">
                {pastEvents.length > 0 ? (
                  pastEvents.map((event) => (
                    <Card key={event.title} className="overflow-hidden flex flex-col sm:flex-row">
                       {event.image && event.image.imageUrl && 
                        <div className="w-full sm:w-1/3">
                          <Image src={event.image.imageUrl} alt={event.title} width={400} height={250} className="w-full h-full object-cover" data-ai-hint={event.image.imageHint}/>
                        </div>
                       }
                      <div className="w-full sm:w-2/3">
                        <CardHeader>
                          <CardTitle>{event.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{event.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                           <Button asChild variant="link" className="px-0 mt-2">
                            <Link href={`/events/${event.title.toLowerCase().replace(/ /g, '-')}`}>View Gallery <ArrowRight className="ml-1 h-4 w-4" /></Link>
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                 ) : (
                  <p className="text-muted-foreground text-center py-8">No past events to show.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
