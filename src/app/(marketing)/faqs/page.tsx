
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { Mail } from "lucide-react";

const faqs = [
    {
        question: "What is Chipukizi VOD Cooperative Society?",
        answer: "Chipukizi VOD (Voice of Drama) Cooperative Society Limited is a youth-owned and run worker cooperative registered under the Kenyan Co-operative Act. We are a creative powerhouse specializing in content production, digital marketing, and youth empowerment. Our mission is to inform, entertain, and promote societal values through professional creative performances."
    },
    {
        question: "What services do you offer?",
        answer: "We offer a wide range of creative and digital services, including professional video production, digital marketing and social media campaigns, brand partnerships, youth training programs in media and marketing, talent development, and educational content creation. You can learn more on our services page."
    },
    {
        question: "How can I join the cooperative as a member?",
        answer: "We are always looking for passionate and talented youth to join our cooperative. To become a member, you can visit our office at The Co-operative University of Kenya in Karen or contact us directly through our contact page to inquire about the membership process and requirements."
    },
    {
        question: "How can my business partner with Chipukizi VOD?",
        answer: "We collaborate with numerous brands, NGOs, educational institutions, and government agencies for digital marketing and entertainment needs. If you are interested in a partnership, please reach out to us via our contact page to discuss how we can work together."
    },
    {
        question: "Where are you located?",
        answer: "Our main office, creative hub, and training facilities are located at The Co-operative University of Kenya, Karen, which is about 20km from the Nairobi CBD, off Lang'ata Road."
    },
    {
        question: "How do I book a service?",
        answer: "You can book any of our services by filling out the form on our 'Book Now' page. Just select the service you are interested in and provide the required details, and our team will get back to you shortly to discuss your project."
    }
];


export default function FAQsPage() {
    return (
        <div className="container py-12 md:py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Frequently Asked Questions</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Find answers to the most common questions about our cooperative, services, and how to get involved.
                </p>
            </div>

            <div className="max-w-3xl mx-auto">
                 <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                         <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left font-semibold text-lg">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground prose prose-lg max-w-none">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Card className="mt-12 text-center bg-muted/50 border-dashed">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
                            <Mail className="h-6 w-6 text-primary"/>
                            Still have questions?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">If you can't find the answer you're looking for, please don't hesitate to reach out to us directly.</p>
                        <Link href="/contact#contact-form" className="font-semibold text-primary hover:underline">
                            Contact Us
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
