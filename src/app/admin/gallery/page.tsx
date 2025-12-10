
'use client';

import { useState, useMemo } from 'react';
import { UploadDropzone } from '@/components/ui/upload-dropzone';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { GalleryMedia } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() =>
    firestore
      ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'))
      : null
  , [firestore, key]);

  const { data: allItems, isLoading } = useCollection<GalleryMedia>(galleryQuery);
  
  const handleUploadSuccess = () => {
    setKey(prevKey => prevKey + 1);
  };

  const filteredAndSortedItems = useMemo(() => {
    if (!allItems) return [];

    let items = [...allItems];

    // Sorting
    if (sortOrder === 'oldest') {
      items.sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
    } else if (sortOrder === 'type') {
      items.sort((a, b) => a.type.localeCompare(b.type));
    }
    // 'newest' is the default from the query

    // Filtering
    if (searchTerm) {
      return items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  }, [allItems, searchTerm, sortOrder]);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Gallery</h1>
        <p className="text-muted-foreground">Upload and manage media for your public gallery.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
            <UploadDropzone onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="md:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>Uploaded Media</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by title..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Sort by Newest</SelectItem>
                                <SelectItem value="oldest">Sort by Oldest</SelectItem>
                                <SelectItem value="type">Sort by Type</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <GallerySkeleton />
                    ) : filteredAndSortedItems.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAndSortedItems.map(item => (
                                <MediaCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                          {searchTerm ? 'No media found for your search.' : 'No media has been uploaded yet.'}
                        </p>
                    )}
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
