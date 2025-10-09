
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Suggestion } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserX } from 'lucide-react';

export default function ManageSuggestionsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const suggestionsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'suggestions'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: suggestions, isLoading } = useCollection<Suggestion>(suggestionsQuery);

    const handleStatusChange = async (suggestionId: string, newStatus: string) => {
        if (!firestore) return;
        const suggestionRef = doc(firestore, 'suggestions', suggestionId);
        try {
            await updateDoc(suggestionRef, { status: newStatus });
            toast({
                title: "Status Updated",
                description: "The suggestion status has been updated.",
            });
        } catch (error) {
            console.error("Error updating suggestion status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update the suggestion status.",
            });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'new': return 'destructive';
            case 'viewed': return 'secondary';
            case 'in-progress': return 'default';
            case 'done': return 'default'; // Success variant would be good here
            default: return 'outline';
        }
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Member Suggestions</CardTitle>
                    <CardDescription>
                        Review and manage suggestions submitted by cooperative members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead className="w-[180px]">From</TableHead>
                                <TableHead>Suggestion</TableHead>
                                <TableHead className="w-[180px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && suggestions?.map((suggestion) => (
                                <TableRow key={suggestion.id}>
                                    <TableCell>{new Date(suggestion.createdAt.toDate()).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {suggestion.isAnonymous ? <UserX className="h-4 w-4 text-muted-foreground"/> : <User className="h-4 w-4 text-muted-foreground"/>}
                                            <span className="font-medium">{suggestion.userName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="line-clamp-2">{suggestion.suggestion}</p>
                                    </TableCell>
                                    <TableCell>
                                         <Select 
                                            defaultValue={suggestion.status} 
                                            onValueChange={(value) => handleStatusChange(suggestion.id, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue>
                                                     <Badge variant={getStatusBadgeVariant(suggestion.status)}>{suggestion.status}</Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="viewed">Viewed</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && suggestions?.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            No suggestions have been submitted yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
