
'use client';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import type { GalleryMedia } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ThumbsUp, MessageSquare, Bookmark, Download, Share2 } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
      <Image src={item.url} alt={item.title} layout="fill" objectFit="contain" sizes="100vw" />
    </AspectRatio>
  );
}

function AuthActionTrigger({ children }: { children: React.ReactNode }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Join the Community!</AlertDialogTitle>
                    <AlertDialogDescription>
                        You need to be logged in to perform this action. Sign up or log in to continue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Link href="/login">Login / Sign Up</Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export default function GalleryDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const mediaRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'gallery', params.id);
  }, [firestore, params.id]);

  const { data: mediaItem, isLoading } = useDoc<GalleryMedia>(mediaRef);

  const handleShare = async () => {
    if (navigator.share && mediaItem) {
        try {
            await navigator.share({
                title: mediaItem.title,
                text: mediaItem.caption || `Check out this media from Chipukizi VOD: ${mediaItem.title}`,
                url: window.location.href,
            });
        } catch (error) {
            console.error('Error sharing:', error);
            toast({ variant: 'destructive', title: 'Could not share', description: 'There was an error trying to share this item.' });
        }
    } else {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied', description: 'The link to this item has been copied to your clipboard.' });
    }
  }

  const handleDownload = () => {
    if (mediaItem?.type !== 'youtube') {
      const link = document.createElement('a');
      link.href = mediaItem!.url;
      link.download = mediaItem!.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
        toast({variant: 'destructive', title: 'Download not available for YouTube videos.'})
    }
  }

  const renderActionButtons = () => {
      const commonProps = { variant: "outline", className: "flex-1" } as const;
      
      const likeButton = <Button {...commonProps}><ThumbsUp className="mr-2 h-4 w-4" /> Like</Button>;
      const commentButton = <Button {...commonProps}><MessageSquare className="mr-2 h-4 w-4" /> Comment</Button>;
      const bookmarkButton = <Button {...commonProps}><Bookmark className="mr-2 h-4 w-4" /> Bookmark</Button>;

      if (!user) {
          return (
            <>
              <AuthActionTrigger>{likeButton}</AuthActionTrigger>
              <AuthActionTrigger>{commentButton}</AuthActionTrigger>
              <AuthActionTrigger>{bookmarkButton}</AuthActionTrigger>
            </>
          );
      }

      // TODO: Implement actual like, comment, bookmark logic for logged-in users
      return (
          <>
            <Button {...commonProps} onClick={() => toast({title: 'Coming soon!'})}><ThumbsUp className="mr-2 h-4 w-4" /> Like</Button>
            <Button {...commonProps} onClick={() => toast({title: 'Coming soon!'})}><MessageSquare className="mr-2 h-4 w-4" /> Comment</Button>
            <Button {...commonProps} onClick={() => toast({title: 'Coming soon!'})}><Bookmark className="mr-2 h-4 w-4" /> Bookmark</Button>
          </>
      );
  }

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
                            <p className="text-muted-foreground mb-6">{mediaItem.caption}</p>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                           {renderActionButtons()}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button variant="outline" onClick={handleShare} className="w-full"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                            <Button variant="outline" onClick={handleDownload} className="w-full" disabled={mediaItem.type === 'youtube'}><Download className="mr-2 h-4 w-4" /> Download</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {user ? (
                         <p className="text-sm text-muted-foreground">Commenting is coming soon.</p>
                       ) : (
                         <div className="text-sm text-muted-foreground text-center border-2 border-dashed rounded-md p-6">
                            <p className="mb-4">You must be logged in to view and post comments.</p>
                            <Button asChild variant="secondary">
                                <Link href="/login">Login or Sign Up</Link>
                            </Button>
                         </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
