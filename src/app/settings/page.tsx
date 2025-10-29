
'use client';

import { useUser } from '@/firebase';
import { ProfileForm } from '@/app/dashboard/profile/profile-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { deleteUser } from '@/app/admin/users/actions';
import { ThemeSettings } from './theme-settings';
import { ProfileImageUpload } from './profile-image-upload';

function DeleteAccountSection() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!user || !auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to delete an account.',
      });
      return;
    }

    try {
      // Call the secure server action to delete the user
      const result = await deleteUser(user.uid);

      if (result.success) {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been permanently deleted.',
        });
        // Manually sign out the user on the client, as the server action doesn't affect the client's auth state
        await signOut(auth);
        router.push('/'); // Redirect to home page
        router.refresh(); // Force a refresh to clear any lingering client-side state
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: `An error occurred while deleting your account: ${error.message}`,
      });
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete My Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDeleteAccount}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}


export default function SettingsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div>Loading settings...</div>;
  }

  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }
  return (
    <div className="space-y-8 max-w-3xl">
       <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and site settings.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a new profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
            <ProfileImageUpload user={user} />
        </CardContent>
      </Card>
      <ProfileForm user={user} />
      <ThemeSettings />
      <DeleteAccountSection />
    </div>
  )
}
