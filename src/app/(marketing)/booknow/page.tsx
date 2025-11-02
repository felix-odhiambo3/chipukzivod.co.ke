
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, query, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import type { Service } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters."),
  serviceId: z.string().min(1, "Please select a service."),
  otherServiceDescription: z.string().optional(),
  eventDate: z.date().optional(),
  eventLocation: z.string().optional(),
  eventDuration: z.string().optional(),
}).refine(data => {
    if (data.serviceId === 'other') {
        return !!data.otherServiceDescription && data.otherServiceDescription.length >= 10;
    }
    return true;
}, {
    message: "Description must be at least 10 characters.",
    path: ["otherServiceDescription"],
});

function BookNowFormComponent() {
  const searchParams = useSearchParams();
  const serviceIdParam = searchParams.get('serviceId');
  const serviceTitleParam = searchParams.get('serviceTitle');

  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const servicesQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'services'), orderBy('title')) : null
  , [firestore]);
  const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      serviceId: serviceIdParam || "",
      otherServiceDescription: "",
      eventLocation: "",
      eventDuration: "",
    },
  });

  const selectedServiceId = form.watch("serviceId");

  useEffect(() => {
    if (serviceIdParam) {
      form.setValue('serviceId', serviceIdParam);
    }
  }, [serviceIdParam, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database.' });
      return;
    }

    const selectedService = services?.find(s => s.id === values.serviceId);
    const serviceTitle = values.serviceId === 'other' 
        ? 'Other (Specified)' 
        : selectedService?.title || 'General Inquiry';

    const bookingData: any = {
      ...values,
      serviceTitle,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    
    if (values.eventDate) {
      bookingData.eventDate = format(values.eventDate, 'yyyy-MM-dd');
    } else {
      delete bookingData.eventDate;
    }

    if (!values.eventLocation) delete bookingData.eventLocation;
    if (!values.eventDuration) delete bookingData.eventDuration;
    if (!values.otherServiceDescription) delete bookingData.otherServiceDescription;
    if (!values.phone) delete bookingData.phone;


    try {
      const bookingsCollection = collection(firestore, 'bookings');
      await addDocumentNonBlocking(bookingsCollection, bookingData);
      toast({
        title: "Booking Inquiry Sent!",
        description: "Thank you for your interest. We will get back to you shortly.",
      });
      router.push('/services');
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not send your booking inquiry. Please try again.",
      });
    }
  }

  return (
    <div className="container py-12 md:py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Book a Service</CardTitle>
          <CardDescription>
            Interested in one of our services? Fill out the form below and we'll get in touch with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoadingServices}>
                          <SelectValue placeholder="Select a service..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services?.map(service => (
                          <SelectItem key={service.id} value={service.id}>{service.title}</SelectItem>
                        ))}
                        <SelectItem value="other">Other (Please specify)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedServiceId === 'other' && (
                <FormField
                  control={form.control}
                  name="otherServiceDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please describe the service you are looking for..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {selectedServiceId && selectedServiceId !== 'other' && (
                <div className="space-y-6 p-4 border rounded-md bg-muted/50">
                   <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nairobi, Kenya or Online" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="eventDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Duration (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3 hours, 2 days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+254 712 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us more about your needs..." {...field} rows={5} />
                    </FormControl>
                     <FormDescription>Provide any extra information that might be helpful.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookNowPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookNowFormComponent />
        </Suspense>
    )
}
