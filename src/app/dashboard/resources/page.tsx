
'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Resource } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Download, FileText, Library, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from "next/navigation";

function ResourceLoadingSkeleton() {
    return (
        <div className="w-full">
            <Card className="flex flex-col items-center justify-center p-8 text-center h-[400px]">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <Skeleton className="h-10 w-32" />
            </Card>
        </div>
    );
}

function NoResourcesState() {
    return (
        <Card className="flex flex-col items-center justify-center p-8 text-center h-[400px] bg-muted/20 border-dashed">
            <Library className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold font-headline">No Resources Available</h2>
            <p className="text-muted-foreground mt-2">
                The resource center is currently empty. Please check back later.
            </p>
        </Card>
    );
}


export default function ResourcesPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    const resourcesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'resources'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: resources, isLoading } = useCollection<Resource>(resourcesQuery);
    
    if (isUserLoading) {
        return <ResourceLoadingSkeleton />;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const isLoadingResources = isLoading && !resources;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Resource Center</h1>
                <p className="text-muted-foreground">
                    Access shared documents, guidelines, and training materials.
                </p>
            </div>

            {isLoadingResources && <ResourceLoadingSkeleton />}

            {!isLoadingResources && (!resources || resources.length === 0) && <NoResourcesState />}

            {!isLoadingResources && resources && resources.length > 0 && (
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <CarouselContent>
                        {resources.map((resource) => (
                            <CarouselItem key={resource.id} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                <Card className="flex flex-col h-full">
                                    <CardHeader className="text-center">
                                        <FileText className="mx-auto h-12 w-12 text-primary" />
                                        <CardTitle className="pt-4">{resource.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                                    </CardContent>
                                    <CardContent className="mt-auto">
                                        <Button asChild className="w-full">
                                            <Link href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2 h-4 w-4"/>
                                                Download PDF
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12" />
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12" />
                </Carousel>
            )}
        </div>
    );
}
