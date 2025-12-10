
'use client';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GalleryMedia } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, ThumbsUp, MessageSquare, Download, Bookmark, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const MediaCard = ({ item }: { item: GalleryMedia }) => {
  const { toast } = useToast();
  const isYoutube = item.type === 'youtube';
  const videoId = isYoutube
    ? (() => {
        try {
          const url = new URL(item.url);
          return url.searchParams.get('v');
        } catch {
          return null;
        }
      })()
    : null;

  const thumbnail = isYoutube
    ? `https://img.youtube.com/vi/${videoId || 'default'}/hqdefault.jpg`
    : item.url;

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.type !== 'youtube') {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
        toast({variant: 'destructive', title: 'Download not available for YouTube videos.'})
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col group">
      <Link href={`/gallery/${item.id}`} className="block">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <Image
            src={thumbnail || '/placeholder.jpg'}
            alt={item.title || 'Gallery media'}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {(item.type === 'video' || isYoutube) && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-white/80" />
            </div>
          )}
        </AspectRatio>
      </Link>
      <CardHeader>
        <CardTitle className="truncate">{item.title || 'Untitled'}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.caption || ''}
        </p>
      </CardHeader>
      <CardFooter className="mt-auto flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> 0</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> 0</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast({ title: 'Login to bookmark!' })}}><Bookmark className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} disabled={isYoutube}><Download className="h-4 w-4" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const GallerySkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <Card key={i}>
        <AspectRatio ratio={16 / 9}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
      </Card>
    ))}
  </div>
);

export default function GalleryPage() {
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() =>
    firestore
      ? query(
          collection(firestore, 'gallery'),
          orderBy('createdAt', 'desc')
        )
      : null
  , [firestore]);

  const { data: allItems, isLoading } = useCollection<GalleryMedia>(galleryQuery);

  const mediaItems = useMemo(() => {
    if (!allItems) return [];
    return allItems.filter(item => item.type === 'image' || item.type === 'video');
  }, [allItems]);

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Gallery</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore our creative work, projects, and community highlights.
        </p>
      </div>

      <Tabs defaultValue="uploads" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="uploads">Media Uploads</TabsTrigger>
          <Link
            href="https://www.youtube.com/@chipukizivoiceofdrama5137"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "hover:bg-background/80"
            )}
          >
            YouTube <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </TabsList>

        <TabsContent value="uploads" className="mt-8">
          {isLoading ? (
            <GallerySkeleton />
          ) : mediaItems?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mediaItems.map(item => <MediaCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              No media has been uploaded yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
