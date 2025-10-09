'use client';
import { EventForm } from '../event-form';

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new event.
        </p>
      </div>
      <EventForm />
    </div>
  );
}
