'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Globe, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Event } from '@/lib/data';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function DeleteEventButton({ eventId }: { eventId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = () => {
        if (!firestore) return;
        const eventRef = doc(firestore, 'events', eventId);
        deleteDocumentNonBlocking(eventRef);
        toast({
            title: "Event Deleted",
            description: "The event has been successfully deleted.",
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function ManageEventsPage() {
    const firestore = useFirestore();

    const eventsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'events'), orderBy('startDatetime', 'desc'));
    }, [firestore]);

    const { data: events, isLoading } = useCollection<Event>(eventsQuery);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Events</h1>
                    <p className="text-muted-foreground">
                        Create, edit, and publish events for the cooperative.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/events/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>
            
            {isLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                             <CardHeader>
                                <Skeleton className="h-6 w-3/4"/>
                                <Skeleton className="h-4 w-1/2 mt-2"/>
                            </CardHeader>
                             <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                            <CardContent className="flex justify-between items-center">
                                <Skeleton className="h-6 w-20"/>
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 w-10"/>
                                    <Skeleton className="h-10 w-10"/>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && events && events.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id}>
                            <CardHeader>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>{new Date(event.startDatetime).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                            </CardContent>
                             <CardContent className="flex justify-between items-center">
                                {event.status === 'published' ? (
                                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                        <Globe className="h-4 w-4" /> Published
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                                        <EyeOff className="h-4 w-4" /> Draft
                                    </span>
                                )}
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="icon">
                                        <Link href={`/admin/events/edit/${event.id}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <DeleteEventButton eventId={event.id} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : !isLoading && (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Events Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new event.</p>
                    <Button asChild className="mt-6">
                         <Link href="/admin/events/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Your First Event
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
