'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Booking } from '@/lib/data';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageBookingsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const bookingsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    const handleMarkAsContacted = (bookingId: string) => {
        if (!firestore) return;
        const bookingRef = doc(firestore, 'bookings', bookingId);
        updateDocumentNonBlocking(bookingRef, { status: 'contacted' });
        toast({
            title: "Booking Updated",
            description: "The booking has been marked as contacted.",
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Bookings</CardTitle>
                    <CardDescription>
                        View and manage service booking inquiries from customers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && bookings?.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{booking.name}</div>
                                        <div className="text-sm text-muted-foreground">{booking.email}</div>
                                        {booking.phone && <div className="text-sm text-muted-foreground">{booking.phone}</div>}
                                    </TableCell>
                                    <TableCell>{booking.serviceTitle}</TableCell>
                                    <TableCell>
                                        <Badge variant={booking.status === 'pending' ? 'destructive' : 'default'}>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {booking.status === 'pending' && (
                                            <Button size="sm" onClick={() => handleMarkAsContacted(booking.id)}>
                                                Mark as Contacted
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && bookings?.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            No bookings found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
