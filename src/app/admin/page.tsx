
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Briefcase, ShoppingCart, ArrowRight, Megaphone, Lightbulb, Mail } from "lucide-react";

const adminDashboardLinks = [
  {
    title: "Manage Users",
    description: "Create, edit, and manage user accounts and roles.",
    icon: Users,
    href: "/admin/users"
  },
  {
    title: "Manage Events",
    description: "Create and publish events for the cooperative.",
    icon: Briefcase,
    href: "/admin/events"
  },
  {
    title: "Manage Services",
    description: "Add or remove services offered by the cooperative.",
    icon: ShoppingCart,
    href: "/admin/services"
  },
   {
    title: "Manage Announcements",
    description: "Create and publish announcements for all users.",
    icon: Megaphone,
    href: "/admin/announcements"
  },
  {
    title: "View Suggestions",
    description: "Review feedback and suggestions from members.",
    icon: Lightbulb,
    href: "/admin/suggestions"
  },
  {
    title: "Contact Inquiries",
    description: "Manage messages from the contact and booking forms.",
    icon: Mail,
    href: "/admin/contacts"
  }
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Chipukizi VOD Cooperative Society administration panel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminDashboardLinks.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <item.icon className="h-5 w-5 text-primary" />
                <span>{item.title}</span>
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href={item.href}>
                  Go to Section <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
