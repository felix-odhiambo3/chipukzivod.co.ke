
'use client';

import { useState, useMemo, useTransition } from 'react';
import { UploadDropzone } from '@/components/ui/upload-dropzone';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { GalleryMedia } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Search, Edit, Trash2, MoreVertical, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { deleteMedia, toggleMediaStatus, updateMedia } from './actions';


const editFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    caption: z.string().optional(),
});

function EditMediaDialog({ item, open, onOpenChange }: { item: GalleryMedia, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
        defaultValues: { title: item.title, caption: item.caption || '' },
    });

    const onSubmit = async (values: z.infer<typeof editFormSchema>) => {
        const result = await updateMedia(item.id, values);
        if (result.success) {
            toast({ title: "Media Updated" });
            onOpenChange(false);
        } else {
            toast({ variant: 'destructive', title: "Update Failed", description: result.error });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Media Details</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="caption" render={({ field }) => (<FormItem><FormLabel>Caption</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="flex justify-end gap-2">
                           <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                           <Button type="submit" disabled={form.formState.isSubmitting}>Save Changes</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const MediaCard = ({ item }: { item: GalleryMedia }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isToggling, startToggleTransition] = useTransition();
  const { toast } = useToast();

  const isYoutube = item.type === 'youtube';
  const isVideo = item.type === 'video';
  const thumbnail = isYoutube
    ? `https://img.youtube.com/vi/${new URL(item.url).searchParams.get('v')}/hqdefault.jpg`
    : item.url;

  const handleDelete = async () => {
    const result = await deleteMedia(item.id);
    if (result.success) {
        toast({ title: "Media Deleted" });
    } else {
        toast({ variant: 'destructive', title: "Delete Failed", description: result.error });
    }
  }
  
  const handleStatusToggle = () => {
      startToggleTransition(async () => {
          const result = await toggleMediaStatus(item.id, item.status || 'published');
          if (result.success) {
              toast({ title: "Status Updated", description: `Media is now ${result.newStatus}.` });
          } else {
              toast({ variant: 'destructive', title: "Status update failed", description: result.error });
          }
      });
  }

  return (
    <>
    <Card className="overflow-hidden group">
      <Link href={`/gallery/${item.id}`} className="block relative">
        <div className="aspect-video bg-muted relative">
          <Image
            src={thumbnail || '/placeholder.jpg'}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {(isYoutube || isVideo) && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-white/80" />
            </div>
          )}
           <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded-full ${item.status === 'published' ? 'bg-green-600' : 'bg-amber-600'}`}>
                {item.status === 'published' ? 'Published' : 'Draft'}
            </div>
        </div>
      </Link>
       <CardHeader>
        <CardTitle className="truncate text-base">{item.title}</CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-end">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsEditOpen(true)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </CardFooter>
    </Card>
    <EditMediaDialog item={item} open={isEditOpen} onOpenChange={setIsEditOpen} />
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{item.title}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
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
