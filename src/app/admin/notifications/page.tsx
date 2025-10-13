
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Trash2, Bell } from 'lucide-react';
import Link from 'next/link';
import type { Notification } from '@/lib/data';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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

function DeleteNotificationButton({ notificationId }: { notificationId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = () => {
        if (!firestore) return;
        const notificationRef = doc(firestore, 'notifications', notificationId);
        deleteDocumentNonBlocking(notificationRef);
        toast({
            title: "Notification Deleted",
            description: "The notification has been successfully deleted.",
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the notification.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function ManageNotificationsPage() {
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'notifications'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Notifications</h1>
                    <p className="text-muted-foreground">
                        Send and manage real-time notifications for all users.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/notifications/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Send Notification
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Sent Notifications</CardTitle>
                    <CardDescription>A list of all notifications that have been sent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Date Sent</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && notifications?.map((notification) => (
                                <TableRow key={notification.id}>
                                    <TableCell className="font-medium">{notification.title}</TableCell>
                                    <TableCell className="text-muted-foreground line-clamp-1">{notification.message}</TableCell>
                                    <TableCell>{new Date(notification.createdAt.toDate()).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <DeleteNotificationButton notificationId={notification.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {!isLoading && (!notifications || notifications.length === 0) && (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Notifications Sent</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Get started by sending a new notification.</p>
                            <Button asChild className="mt-6">
                                <Link href="/admin/notifications/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Send Your First Notification
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
