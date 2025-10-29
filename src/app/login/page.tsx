
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, authErrorEmitter } from '@/firebase/non-blocking-login';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import type { AuthError, User } from 'firebase/auth';
import { updateUser } from '../admin/users/actions';
import { getIdTokenResult } from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // This function will handle user promotion and redirection
  const handleLoginSuccess = useCallback(async (loggedInUser: User) => {
    // ONE-TIME-ONLY: Check if this is the designated admin email
    if (loggedInUser.email === 'admin@chipukizivod.co.ke') {
      try {
        // Securely set the custom claim on the server
        await updateUser(loggedInUser.uid, { role: 'admin' });
        
        // Force refresh the token to get the new custom claim immediately
        const idTokenResult = await getIdTokenResult(loggedInUser, true); 
        
        if (idTokenResult.claims.role === 'admin') {
          toast({
            title: 'Admin Promotion Success',
            description: 'Your account has been promoted to Admin.',
          });
          router.replace('/admin'); // Redirect to admin dashboard
          return;
        }
      } catch (error) {
        console.error("Failed to promote admin:", error);
        toast({
          variant: "destructive",
          title: 'Admin Promotion Failed',
          description: 'Could not set admin role. Please contact support.',
        });
      }
    }

    // For all other users, or if admin promotion fails, check role and redirect
    const idTokenResult = await getIdTokenResult(loggedInUser);
    if (idTokenResult.claims.role === 'admin') {
      router.replace('/admin');
    } else {
      router.replace('/dashboard');
    }
  }, [router, toast]);


  useEffect(() => {
    if (!isUserLoading && user) {
      handleLoginSuccess(user);
    }
  }, [user, isUserLoading, handleLoginSuccess]);

  useEffect(() => {
    const handleAuthError = (error: AuthError) => {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        description = 'An account with this email already exists.';
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description,
      });
    };

    authErrorEmitter.on(handleAuthError);
    return () => {
      authErrorEmitter.off(handleAuthError);
    };
  }, [toast]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not connect to authentication service.',
      });
      return;
    }
    initiateEmailSignIn(auth, values.email, values.password);
  };
  
  if (isUserLoading || user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 left-4">
        <Button asChild variant="ghost">
          <Link href="/">← Back to Home</Link>
        </Button>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-headline">Member Portal</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="member@chipukizi.coop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="ml-auto inline-block text-sm underline hover:text-primary">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging In...' : 'Login'}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
