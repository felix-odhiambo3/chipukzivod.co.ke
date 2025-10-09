
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
import { PlusCircle, Edit, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Resource } from '@/lib/data';
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

function DeleteResourceButton({ resourceId }: { resourceId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = () => {
        if (!firestore) return;
        const resourceRef = doc(firestore, 'resources', resourceId);
        deleteDocumentNonBlocking(resourceRef);
        toast({
            title: "Resource Deleted",
            description: "The resource has been successfully deleted.",
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
                        This action cannot be undone. This will permanently delete the resource.
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

export default function ManageResourcesPage() {
    const firestore = useFirestore();

    const resourcesQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'resources'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: resources, isLoading } = useCollection<Resource>(resourcesQuery);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Resources</h1>
                    <p className="text-muted-foreground">
                        Create, edit, and manage member resources.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/resources/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Resource
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Resources</CardTitle>
                    <CardDescription>A list of all downloadable resources for members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading && [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && resources?.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">{resource.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{resource.description}</TableCell>
                                    <TableCell>{new Date(resource.createdAt.toDate()).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={`/admin/resources/edit/${resource.id}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteResourceButton resourceId={resource.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {!isLoading && (!resources || resources.length === 0) && (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Resources Yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new resource.</p>
                            <Button asChild className="mt-6">
                                <Link href="/admin/resources/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Your First Resource
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
