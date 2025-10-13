
'use client';
import { NotificationForm } from '../notification-form';

export default function NewNotificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Send New Notification</h1>
        <p className="text-muted-foreground">
          Fill in the details below to send a real-time notification to all users.
        </p>
      </div>
      <NotificationForm />
    </div>
  );
}
