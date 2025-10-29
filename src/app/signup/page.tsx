
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createUser } from '../admin/users/actions';
import { signInWithEmailAndPassword } from 'firebase/auth';

const formSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Use the secure server action to create the user
      await createUser({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        role: 'member', // Always default to 'member'
      });

      toast({
        title: 'Account Created',
        description: "You've been successfully signed up! Logging you in...",
      });

      // Automatically sign in the user after successful registration
      if (auth) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        // The main layout's useEffect will handle redirection
      } else {
        router.push('/login');
      }

    } catch (error: any) {
      console.error('Error signing up:', error);
      let description = "Could not create your account. Please try again later.";
      if (error.message.includes('auth/email-already-in-use') || error.message.includes('email-already-exists')) {
          description = 'An account with this email address already exists.'
      }
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: description,
      });
    }
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
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join the Chipukizi Hub member portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="member@chipukizi.coop"
                        {...field}
                      />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
