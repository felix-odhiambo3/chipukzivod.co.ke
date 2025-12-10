'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import React from 'react';
import { sendContactResponse } from './actions';


const responseSchema = z.object({
    message: z.string().min(10, "Response must be at least 10 characters."),
});

function RespondDialog({ contact, onOpenChange, open }: { contact: ContactInquiry; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof responseSchema>>({
        resolver: zodResolver(responseSchema),
        defaultValues: {
            message: `Hi ${contact.name},\n\nRegarding your inquiry about "${contact.service}"...\n\n`,
        },
    });

    const onSubmit = async (values: z.infer<typeof responseSchema>) => {
        try {
            await sendContactResponse(contact, values.message);
            toast({
                title: "Response Sent",
                description: "The response has been sent to the user.",
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error sending response:", error);
            toast({
                variant: "destructive",
                title: "Send Failed",
                description: "Could not send the response.",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Respond to {contact.name}</DialogTitle>
                    <DialogDescription>
                        Send a notification to the user in response to their inquiry.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={8} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Sending...' : 'Send Response'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function ContactRow({ contact }: { contact: ContactInquiry }) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    return (
        <>
            <TableRow>
                <TableCell colSpan={5} className="p-0">
                    <AccordionItem value={`item-${contact.id}`} className="border-b-0">
                        <AccordionTrigger className="p-4 grid grid-cols-5 w-full text-left items-center hover:no-underline">
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
                                <Button size="sm" onClick={(e) => { e.stopPropagation(); setIsDialogOpen(true); }} disabled={contact.status === 'responded'}>
                                    {contact.status === 'responded' ? 'Responded' : 'Respond'}
                                </Button>
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
            <RespondDialog contact={contact} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    )
}

export default function ManageContactsPage() {
    const firestore = useFirestore();

    const contactsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'contacts'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: contacts, isLoading } = useCollection<ContactInquiry>(contactsQuery);

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
                    <Accordion type="single" collapsible className="w-full">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-1/5">Date</TableHead>
                                    <TableHead className="w-1/5">From</TableHead>
                                    <TableHead className="w-1/5">Service</TableHead>
                                    <TableHead className="w-1/5">Status</TableHead>
                                    <TableHead className="w-1/5 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && contacts?.map((contact) => (
                                    <ContactRow key={contact.id} contact={contact} />
                                ))}
                            </TableBody>
                        </Table>
                    </Accordion>
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
