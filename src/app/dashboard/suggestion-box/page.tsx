
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  suggestion: z.string().min(10, "Suggestion must be at least 10 characters."),
  isAnonymous: z.boolean().default(false),
});

export default function SuggestionBoxPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      suggestion: "",
      isAnonymous: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a suggestion.' });
      return;
    }

    const suggestionData = {
      ...values,
      userId: values.isAnonymous ? 'anonymous' : user.uid,
      userName: values.isAnonymous ? 'Anonymous' : user.displayName || 'Unnamed Member',
      status: 'new',
      createdAt: serverTimestamp(),
    };

    try {
      const suggestionsCollection = collection(firestore, 'suggestions');
      await addDocumentNonBlocking(suggestionsCollection, suggestionData);
      toast({
        title: "Suggestion Sent!",
        description: "Thank you for your feedback. We appreciate your input.",
      });
      form.reset();
      router.push('/dashboard');
    } catch (error) {
      console.error("Error creating suggestion:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not send your suggestion. Please try again.",
      });
    }
  }

  if (isUserLoading) {
      return <div>Loading...</div>
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Suggestion Box</h1>
            <p className="text-muted-foreground">
                Have an idea to improve the cooperative? Share it with us!
            </p>
        </div>
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb /> Your Suggestion
                </CardTitle>
                <CardDescription>Your feedback helps us grow and improve. All suggestions are reviewed by the leadership team.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="suggestion"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Suggestion</FormLabel>
                        <FormControl>
                        <Textarea placeholder="I think it would be great if..." {...field} rows={6} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                Submit Anonymously
                                </FormLabel>
                                <FormDescription>
                                If you check this box, your name will not be attached to your suggestion.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                    />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
    </div>
  );
}
