
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
import type { ContactInquiry } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ManageContactsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const contactsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'contacts'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: contacts, isLoading } = useCollection<ContactInquiry>(contactsQuery);

    const handleMarkAsResponded = async (contactId: string) => {
        if (!firestore) return;
        const contactRef = doc(firestore, 'contacts', contactId);
        try {
            await updateDoc(contactRef, { status: 'responded' });
            toast({
                title: "Inquiry Updated",
                description: "The inquiry has been marked as responded.",
            });
        } catch (error) {
            console.error("Error updating contact status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update the inquiry status.",
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Form Inquiries</CardTitle>
                    <CardDescription>
                        View and manage messages submitted through the contact form.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5}><Skeleton className="h-20 w-full" /></TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && contacts?.map((contact) => (
                                <Accordion key={contact.id} type="single" collapsible asChild>
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <AccordionItem value={`item-${contact.id}`} className="border-b-0">
                                                <AccordionTrigger className="p-4 grid grid-cols-5 w-full text-left items-center">
                                                    <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                                                    <span>
                                                        <div className="font-medium">{contact.name}</div>
                                                        <div className="text-sm text-muted-foreground">{contact.email}</div>
                                                    </span>
                                                    <span>{contact.service}</span>
                                                    <span>
                                                        <Badge variant={contact.status === 'pending' ? 'destructive' : 'default'}>
                                                            {contact.status}
                                                        </Badge>
                                                    </span>
                                                    <span className="text-right">
                                                        {contact.status === 'pending' && (
                                                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleMarkAsResponded(contact.id); }}>
                                                                Mark as Responded
                                                            </Button>
                                                        )}
                                                    </span>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 bg-muted/50">
                                                    <div className="prose prose-sm max-w-none">
                                                        <p><strong>Phone:</strong> {contact.phone || 'N/A'}</p>
                                                        <p><strong>Organization:</strong> {contact.organization || 'N/A'}</p>
                                                        <p><strong>Preferred Contact:</strong> {contact.contactMethod}</p>
                                                        <p><strong>Preferred Time:</strong> {contact.preferredTime}</p>
                                                        <h4>Message:</h4>
                                                        <blockquote>{contact.message}</blockquote>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </TableCell>
                                    </TableRow>
                                </Accordion>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && contacts?.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            No contact inquiries found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
