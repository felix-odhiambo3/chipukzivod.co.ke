'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import type { UserProfile } from '@/lib/data';
import {
  deleteUser,
  sendPasswordReset,
  type UserFormData,
} from './actions';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { UserForm } from './user-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function UserActions({ user }: { user: UserProfile }) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      toast({
        title: 'User Deleted',
        description: `${user.displayName} has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Could not delete user.',
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User does not have an email address.',
      });
      return;
    }
    try {
      await sendPasswordReset(user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${user.email}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Could not send password reset email.',
      });
    }
  };

  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DialogTrigger asChild>
              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={handlePasswordReset}>
              Send Password Reset
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">
                  Delete User
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the user and their associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <UserForm
            existingUser={user}
            onFormSubmit={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ManageUsersPage() {
  const firestore = useFirestore();
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('displayName'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manage Users</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage user accounts.
          </p>
        </div>
        <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <UserForm onFormSubmit={() => setIsCreateFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading &&
                users?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.photoURL} alt={user.displayName} />
                          <AvatarFallback>
                            {user.displayName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions user={user} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {!isLoading && users?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
