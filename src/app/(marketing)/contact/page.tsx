
'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { FaBullhorn, FaUsers, FaStar, FaVideo, FaShareAlt, FaMapMarkerAlt, FaPhone, FaClock, FaEnvelope, FaCertificate, FaFacebook, FaYoutube, FaTiktok, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import { Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  organization: z.string().optional(),
  service: z.string().min(1, "Please select a service."),
  message: z.string().min(10, "Message must be at least 10 characters."),
  contactMethod: z.string(),
  preferredTime: z.string(),
});


const services = [
  { icon: FaVideo, title: "Video Production", description: "Professional video content creation for marketing and educational purposes" },
  { icon: FaBullhorn, title: "Digital Marketing", description: "Strategic social media campaigns and brand promotion" },
  { icon: FaUsers, title: "Youth Training", description: "Skills development programs for creative professionals" },
  { icon: FaStar, title: "Content Creation", description: "Engaging content that educates and inspires audiences" },
];

const contactCards = [
    {
        icon: FaShareAlt,
        title: "Connect With Us",
        content: (
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/ChipukiziEntertainment" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><FaFacebook className="h-6 w-6"/></a>
              <a href="https://www.youtube.com/@chipukizivoiceofdrama5137" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><FaYoutube className="h-6 w-6"/></a>
              <a href="https://www.tiktok.com/@chipukizivoiceofdrama?_t=ZM-8xL8gAQ77Ha&_r=1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><FaTiktok className="h-6 w-6"/></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><FaInstagram className="h-6 w-6"/></a>
            </div>
        )
    },
    { icon: FaMapMarkerAlt, title: "Main Office & Training Center", content: <p><strong>Address:</strong> Nairobi, Kenya <br/> Visit our creative hub and training facilities</p> },
    { icon: FaPhone, title: "Phone", content: <><p><strong>General Inquiries:</strong> <a href="tel:+254725710350" className="hover:text-primary block">+254 725 710 350</a></p><p><strong>Marketing Services:</strong> <a href="tel:+254782909349" className="hover:text-primary block">+254 782 909 349</a></p></> },
    { icon: FaClock, title: "Business Hours", content: <><p><strong>Monday-Friday:</strong> 8am - 6pm</p><p><strong>Saturday:</strong> 9am - 4pm</p><p><strong>Sunday:</strong> Closed</p></> },
    { icon: FaEnvelope, title: "Email", content: <p><strong>General:</strong> <a href="mailto:voiceofdramacoop@gmail.com" className="hover:text-primary block break-all">voiceofdramacoop@gmail.com</a></p> },
    { icon: FaCertificate, title: "Registration Info", content: <><p><strong>Cooperative Society Registration:</strong></p><p>Registered under the Kenyan Cooperative Act</p></> },
];

export default function ContactPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization: "",
      service: "",
      message: "",
      contactMethod: "email",
      preferredTime: "anytime",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database.' });
      return;
    }

    const contactData = {
      ...values,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      const contactsCollection = collection(firestore, 'contacts');
      addDocumentNonBlocking(contactsCollection, contactData);
      toast({
        title: "Message Sent!",
        description: "Thank you for your inquiry. We will get back to you shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Error creating contact inquiry:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not send your message. Please try again.",
      });
    }
  }

  return (
    <div>
      <section className="relative h-[400px] bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/images/w2eb.jpg')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Contact Kenya's Creative Experts Today</h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90">
            We're here to help with all your digital marketing and creative content needs. Contact us today for expert advice, free consultations, or to schedule a session.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="#contact-form">Get Started!</Link>
          </Button>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container">
            <h2 className="text-3xl font-bold font-headline text-center mb-12">Our Creative & Digital Marketing Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map(service => (
                    <Card key={service.title} className="text-center">
                        <CardHeader>
                            <service.icon className="mx-auto text-4xl text-primary mb-3" />
                            <CardTitle className="text-xl">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">{service.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contactCards.map(card => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <card.icon className="text-2xl text-primary flex-shrink-0" />
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {card.content}
                    </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact-form" className="py-16 bg-background">
        <div className="container">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold font-headline">Schedule Training or Request a Consultation</CardTitle>
              <CardDescription>Fill out the form below and we'll get in touch with you.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name *</FormLabel> <FormControl> <Input placeholder="John Doe" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address *</FormLabel> <FormControl> <Input placeholder="you@example.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl> <Input placeholder="+254 712 345 678" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="organization" render={({ field }) => ( <FormItem> <FormLabel>Organization / Company</FormLabel> <FormControl> <Input placeholder="Your Company Inc." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    </div>

                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="video-production">Video Production</SelectItem>
                              <SelectItem value="digital-marketing">Digital Marketing Campaign</SelectItem>
                              <SelectItem value="youth-training">Youth Training Program</SelectItem>
                              <SelectItem value="content-creation">Content Creation</SelectItem>
                              <SelectItem value="brand-promotion">Brand Promotion</SelectItem>
                              <SelectItem value="consultation">General Consultation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <FormField control={form.control} name="message" render={({ field }) => ( <FormItem> <FormLabel>Message *</FormLabel> <FormControl> <Textarea placeholder="Tell us about your project or training needs..." {...field} rows={5} /> </FormControl> <FormMessage /> </FormItem> )} />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Method</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a method..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Time</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Morning (8am-12pm)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                              <SelectItem value="evening">Evening (5pm-7pm)</SelectItem>
                              <SelectItem value="anytime">Anytime</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="text-center">
                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Sending..." : <> <Send className="mr-2 h-4 w-4" /> Send Message</>}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

       <section className="w-full h-[400px] bg-muted">
         <iframe
            src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d1080.2685147330374!2d36.727538!3d-1.366431!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMjInMDAuMCJTIDM2wrA0Myc0MC42IkU!5e1!3m2!1sen!2ske!4v1762154578695!5m2!1sen!2ske"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Co-operative University of Kenya Location"
          ></iframe>
      </section>
    </div>
  );
}

    