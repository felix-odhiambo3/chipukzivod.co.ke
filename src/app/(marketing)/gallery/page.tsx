
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GalleryMedia } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, ThumbsUp, MessageSquare, Download, Bookmark } from 'lucide-react';
import Link from 'next/link';

function MediaCard({ item }: { item: GalleryMedia }) {
  const isYoutube = item.type === 'youtube';
  const youtubeThumbnail = isYoutube ? `https://img.youtube.com/vi/${new URL(item.url).searchParams.get('v')}/hqdefault.jpg` : '';

  return (
    <Card className="overflow-hidden flex flex-col group">
      <Link href={`/gallery/${item.id}`} className="block">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          {isYoutube ? (
            <div className="relative w-full h-full">
              <Image src={youtubeThumbnail} alt={item.title} fill style={{objectFit: 'cover'}} />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white/80" />
              </div>
            </div>
          ) : (
             <Image src={item.url} alt={item.title} fill style={{objectFit: 'cover'}} className="transition-transform duration-300 group-hover:scale-105"/>
          )}
        </AspectRatio>
      </Link>
      <CardHeader>
        <CardTitle className="truncate">{item.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.caption || ' '}</p>
      </CardHeader>
      <CardFooter className="mt-auto flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> 0</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> 0</span>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Bookmark className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function GalleryLoadingSkeleton() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <AspectRatio ratio={16/9}>
                        <Skeleton className="h-full w-full" />
                    </AspectRatio>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                        <div className="flex gap-4">
                            <Skeleton className="h-5 w-8" />
                            <Skeleton className="h-5 w-8" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}


export default function GalleryPage() {
    const firestore = useFirestore();

    const mediaQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'gallery'), where('type', 'in', ['image', 'video']), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const youtubeQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'gallery'), where('type', '==', 'youtube'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: mediaItems, isLoading: isLoadingMedia } = useCollection<GalleryMedia>(mediaQuery);
    const { data: youtubeItems, isLoading: isLoadingYoutube } = useCollection<GalleryMedia>(youtubeQuery);

    return (
        <div className="container py-12 md:py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Gallery</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Explore our creative work, projects, and community highlights.
                </p>
            </div>
            
            <Tabs defaultValue="uploads" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="uploads">Media Uploads</TabsTrigger>
                    <TabsTrigger value="youtube">YouTube</TabsTrigger>
                </TabsList>
                <TabsContent value="uploads" className="mt-8">
                    {isLoadingMedia ? <GalleryLoadingSkeleton /> : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mediaItems?.map(item => <MediaCard key={item.id} item={item} />)}
                        </div>
                    )}
                    {!isLoadingMedia && mediaItems?.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">No media has been uploaded yet.</div>
                    )}
                </TabsContent>
                <TabsContent value="youtube" className="mt-8">
                    {isLoadingYoutube ? <GalleryLoadingSkeleton /> : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {youtubeItems?.map(item => <MediaCard key={item.id} item={item} />)}
                        </div>
                    )}
                     {!isLoadingYoutube && youtubeItems?.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">No YouTube videos have been added yet.</div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
