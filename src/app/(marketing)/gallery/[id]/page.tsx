
'use client';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import type { GalleryMedia } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ThumbsUp, MessageSquare, Bookmark } from 'lucide-react';

function MediaDisplay({ item }: { item: GalleryMedia }) {
  const isYoutube = item.type === 'youtube';
  
  if (isYoutube) {
    const videoId = new URL(item.url).searchParams.get('v');
    return (
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      </AspectRatio>
    );
  }

  if (item.type === 'video') {
    return (
      <AspectRatio ratio={16 / 9}>
        <video controls src={item.url} className="w-full h-full rounded-lg bg-black">
          Your browser does not support the video tag.
        </video>
      </AspectRatio>
    );
  }

  // Default to image
  return (
    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
      <Image src={item.url} alt={item.title} layout="fill" objectFit="contain" />
    </AspectRatio>
  );
}


export default function GalleryDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const mediaRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'gallery', params.id);
  }, [firestore, params.id]);

  const { data: mediaItem, isLoading } = useDoc<GalleryMedia>(mediaRef);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="w-full aspect-video rounded-lg" />
        <div className="mt-8">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6 mt-2" />
        </div>
      </div>
    );
  }

  if (!mediaItem) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Media Not Found</h1>
        <p className="text-muted-foreground mt-2">The item you are looking for does not exist or may have been removed.</p>
        <Button asChild className="mt-8">
          <Link href="/gallery">Back to Gallery</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container py-8 md:py-12">
        <Button asChild variant="ghost" className="mb-8">
            <Link href="/gallery">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Gallery
            </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
                <MediaDisplay item={mediaItem} />
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>{mediaItem.title}</CardTitle>
                        <CardDescription>
                            Uploaded on {new Date(mediaItem.createdAt.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mediaItem.caption && (
                            <p className="text-muted-foreground">{mediaItem.caption}</p>
                        )}
                         <div className="mt-6 flex items-center space-x-6 text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <ThumbsUp className="h-5 w-5" />
                                <span className="text-sm font-medium">0 Likes</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="h-5 w-5" />
                                <span className="text-sm font-medium">0 Comments</span>
                            </span>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Comments are coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

