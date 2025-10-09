'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Edit, HelpingHand, Lightbulb, Megaphone } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase/index";

const dashboardItems = [
    {
        title: "Edit Your Profile",
        description: "Keep your information up to date.",
        icon: Edit,
        href: "/profile"
    },
    {
        title: "Latest Announcements",
        description: "See what's new in the cooperative.",
        icon: Megaphone,
        href: "/dashboard/announcements"
    },
    {
        title: "Event Sign-ups",
        description: "RSVP for upcoming workshops and meetings.",
        icon: Calendar,
        href: "/events"
    },
    {
        title: "Resource Center",
        description: "Access shared documents and training materials.",
        icon: HelpingHand,
        href: "/dashboard/resources"
    },
    {
        title: "Suggestion Box",
        description: "Share your ideas to improve our community.",
        icon: Lightbulb,
        href: "/dashboard/suggestion-box"
    },
]

export default function DashboardPage() {
    const { user } = useUser();
    const userName = user?.displayName?.split(' ')[0] || 'Member';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome back, {userName}!</h1>
                <p className="text-muted-foreground">Here's your personal hub for all things Chipukizi.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardItems.map(item => (
                     <Card key={item.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                {item.title}
                            </CardTitle>
                             <item.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <Button asChild variant="link" className="px-0 mt-4">
                                <Link href={item.href}>
                                    Go to section <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                 <Card className="lg:col-span-3 bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary">Become a Partner</CardTitle>
                        <CardDescription>Interested in collaborating with Chipukizi? Find out how you can partner with us to create impact.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="default">
                            <Link href="/partner">Partner With Us</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
