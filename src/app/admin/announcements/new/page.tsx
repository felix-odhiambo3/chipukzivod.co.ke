'use client';
import { AnnouncementForm } from '../announcement-form';

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Create New Announcement</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new announcement.
        </p>
      </div>
      <AnnouncementForm />
    </div>
  );
}

    