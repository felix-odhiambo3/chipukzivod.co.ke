import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/data";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EventsPage() {
  const upcomingEvents = events.filter(e => e.type === 'upcoming');
  const pastEvents = events.filter(e => e.type === 'past');

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
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                {upcomingEvents.map((event) => (
                  <Card key={event.title} className="overflow-hidden">
                    {event.image && <Image src={event.image.imageUrl} alt={event.title} width={400} height={250} className="w-full h-40 object-cover" data-ai-hint={event.image.imageHint}/>}
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                       <Button asChild variant="link" className="px-0 mt-2">
                        <Link href="#">Learn More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="past">
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                {pastEvents.map((event) => (
                  <Card key={event.title} className="overflow-hidden">
                    {event.image && <Image src={event.image.imageUrl} alt={event.title} width={400} height={250} className="w-full h-40 object-cover" data-ai-hint={event.image.imageHint}/>}
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                       <Button asChild variant="link" className="px-0 mt-2">
                        <Link href="#">View Gallery <ArrowRight className="ml-1 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                className="p-0"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
