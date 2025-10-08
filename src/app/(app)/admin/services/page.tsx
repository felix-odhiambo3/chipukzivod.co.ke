'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Service } from '@/lib/data';
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
import Image from 'next/image';

function DeleteServiceButton({ serviceId }: { serviceId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = () => {
        if (!firestore) return;
        const serviceRef = doc(firestore, 'services', serviceId);
        deleteDocumentNonBlocking(serviceRef);
        toast({
            title: "Service Deleted",
            description: "The service has been successfully deleted.",
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
                        This action cannot be undone. This will permanently delete the service.
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

export default function ManageServicesPage() {
    const firestore = useFirestore();

    const servicesQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'services'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: services, isLoading } = useCollection<Service>(servicesQuery);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Services</h1>
                    <p className="text-muted-foreground">
                        Create, edit, and manage services for the cooperative.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/services/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Service
                    </Link>
                </Button>
            </div>
            
            {isLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                             <CardHeader>
                                <Skeleton className="h-48 w-full"/>
                                <Skeleton className="h-6 w-3/4 mt-4"/>
                            </CardHeader>
                             <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                            <CardContent className="flex justify-end gap-2">
                                <Skeleton className="h-10 w-10"/>
                                <Skeleton className="h-10 w-10"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && services && services.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <Card key={service.id} className="flex flex-col">
                            <CardHeader>
                                {service.imageUrl && (
                                    <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                                        <Image src={service.imageUrl} alt={service.title} layout="fill" objectFit="cover" />
                                    </div>
                                )}
                                <CardTitle>{service.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
                            </CardContent>
                             <CardContent className="flex justify-end items-center gap-2">
                                <Button asChild variant="outline" size="icon">
                                    <Link href={`/admin/services/edit/${service.id}`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <DeleteServiceButton serviceId={service.id} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : !isLoading && (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="mt-4 text-lg font-medium">No Services Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new service.</p>
                    <Button asChild className="mt-6">
                         <Link href="/admin/services/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Your First Service
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
