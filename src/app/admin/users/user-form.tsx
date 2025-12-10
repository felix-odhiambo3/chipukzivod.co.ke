
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/data';
import { createUser, updateUser, type UserFormData } from './actions';

const formSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .optional()
    .refine(
      val => val === undefined || val.length === 0 || val.length >= 6,
      'Password must be at least 6 characters.'
    ),
  role: z.enum(['member', 'admin']),
  photoURL: z.string().url().optional().or(z.literal('')),
});

interface UserFormProps {
  existingUser?: UserProfile;
  onFormSubmit?: () => void;
}

export function UserForm({ existingUser, onFormSubmit }: UserFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: existingUser?.displayName || '',
      email: existingUser?.email || '',
      password: '',
      role: existingUser?.role || 'member',
      photoURL: existingUser?.photoURL || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (existingUser) {
        // Update user
        await updateUser(existingUser.id, values);
        toast({
          title: 'User Updated',
          description: 'The user profile has been successfully updated.',
        });
      } else {
        // Create user
        if (!values.password) {
          form.setError('password', {
            type: 'manual',
            message: 'Password is required for new users.',
          });
          return;
        }
        await createUser(values as UserFormData);
        toast({
          title: 'User Created',
          description: 'The new user has been successfully created.',
        });
      }
      onFormSubmit?.();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description:
          error instanceof Error ? error.message : 'Could not save the user.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  {...field}
                  // Prevent email change for existing users to maintain consistency.
                  disabled={!!existingUser}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!existingUser && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/photo.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Saving...'
              : existingUser
              ? 'Update User'
              : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
