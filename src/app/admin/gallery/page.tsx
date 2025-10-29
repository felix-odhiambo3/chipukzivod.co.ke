'use client';

import { useState } from 'react';
import { UploadDropzone } from '@/components/ui/upload-dropzone';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { GalleryMedia } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';

const MediaCard = ({ item }: { item: GalleryMedia }) => {
  const isYoutube = item.type === 'youtube';
  const isVideo = item.type === 'video';
  const thumbnail = isYoutube
    ? `https://img.youtube.com/vi/${new URL(item.url).searchParams.get('v')}/hqdefault.jpg`
    : item.url;

  return (
    <Card className="overflow-hidden group">
      <Link href={`/gallery/${item.id}`} className="block relative">
        <div className="aspect-video bg-muted relative">
          <Image
            src={thumbnail || '/placeholder.jpg'}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {(isYoutube || isVideo) && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>
      </Link>
       <CardHeader>
        <CardTitle className="truncate text-base">{item.title}</CardTitle>
      </CardHeader>
    </Card>
  );
};

const GallerySkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
            <Skeleton className="aspect-video w-full" />
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
        </Card>
      ))}
    </div>
  );

export default function ManageGalleryPage() {
  const [key, setKey] = useState(0); // Used to force-refresh the gallery list
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() =>
    firestore
      ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'))
      : null
  , [firestore, key]);

  const { data: allItems, isLoading } = useCollection<GalleryMedia>(galleryQuery);
  
  const handleUploadSuccess = () => {
    // Increment key to trigger a re-fetch of the useCollection hook
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Gallery</h1>
        <p className="text-muted-foreground">Upload and manage media for your public gallery.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Upload New Media</CardTitle>
                </CardHeader>
                <CardContent>
                    <UploadDropzone uploadCollection="gallery" onUploadSuccess={handleUploadSuccess} />
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>Uploaded Media</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <GallerySkeleton />
                    ) : allItems && allItems.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allItems.map(item => (
                                <MediaCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No media has been uploaded yet.</p>
                    )}
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
