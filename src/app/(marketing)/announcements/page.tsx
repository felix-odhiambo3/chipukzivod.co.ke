
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Announcement } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone } from 'lucide-react';
import Image from 'next/image';

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card>
      {announcement.mediaUrl && (
         <div className="relative h-56 w-full">
          <Image src={announcement.mediaUrl} alt={announcement.title} fill style={{objectFit: 'cover'}} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" data-ai-hint="announcement media"/>
        </div>
      )}
      <CardHeader>
        <CardTitle>{announcement.title}</CardTitle>
        <CardDescription>
          Posted on {new Date(announcement.createdAt.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
      </CardContent>
    </Card>
  );
}

function AnnouncementsLoadingSkeleton() {
    return (
        <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-56 w-full" />
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function AnnouncementsPage() {
    const firestore = useFirestore();

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'announcements'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: announcements, isLoading } = useCollection<Announcement>(announcementsQuery);

    return (
        <div className="container py-12 md:py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Announcements</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    The latest news, updates, and notices from Chipukizi VOD Cooperative Society.
                </p>
            </div>

            {isLoading ? (
                <div className="max-w-3xl mx-auto">
                    <AnnouncementsLoadingSkeleton />
                </div>
            ) : announcements && announcements.length > 0 ? (
                 <div className="max-w-3xl mx-auto space-y-8">
                    {announcements.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}
                </div>
            ) : (
                <div className="max-w-3xl mx-auto text-center py-16 border-2 border-dashed rounded-lg">
                    <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Announcements Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Please check back later for news and updates.</p>
                </div>
            )}
        </div>
    );
}
