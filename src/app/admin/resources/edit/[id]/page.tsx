
'use client';
import { ResourceForm } from '../../resource-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Resource } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditResourcePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const resourceRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'resources', params.id);
  }, [firestore, params.id]);

  const { data: resource, isLoading } = useDoc<Resource>(resourceRef);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Edit Resource</h1>
        <p className="text-muted-foreground">
          Modify the details of the resource document below.
        </p>
      </div>
      {isLoading && (
        <div className="space-y-4 max-w-2xl">
            <Skeleton className="h-10 w-1/2"/>
            <Skeleton className="h-20 w-full"/>
            <Skeleton className="h-10 w-full"/>
            <div className="flex justify-end">
                <Skeleton className="h-10 w-24"/>
            </div>
        </div>
      )}
      {!isLoading && resource && (
        <ResourceForm resource={resource} />
      )}
      {!isLoading && !resource && <p>Resource not found.</p>}
    </div>
  );
}
