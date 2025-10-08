// This is a placeholder file for the event detail page.
// We will implement this in a future step.

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">
          Event Detail Page
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          This is where the details for event with ID: {params.id} will be displayed.
        </p>
        <Button asChild className="mt-8">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    </div>
  );
}
