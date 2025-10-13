
'use client';

import { useUser } from '@/firebase';
import { ProfileForm } from './profile-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified settings page.
    router.replace('/settings');
  }, [router]);


  if (isUserLoading || !user) {
    // Show a loading state while redirecting
    return (
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
          <p className="text-muted-foreground">
            Loading your settings...
          </p>
        </div>
      </div>
    );
  }

  // This content will be briefly visible before the redirect happens.
  // Or you can return null for a cleaner redirect experience.
  return (
      <div className="space-y-8 max-w-3xl">
        <div>
            <h1 className="text-3xl font-bold font-headline">Profile Settings</h1>
            <p className="text-muted-foreground">
                You are being redirected to the new settings page.
            </p>
            <Button asChild className="mt-4">
                <Link href="/settings">Go to Settings</Link>
            </Button>
        </div>
    </div>
  );
}
