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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getContentSuggestions } from "@/app/actions";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ContentSuggestionsOutput } from "@/ai/flows/content-suggestions-for-cms";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  pageType: z.string().min(1, { message: "Please select a page type." }),
  currentTrends: z.string().min(10, { message: "Please describe current trends." }),
  memberEngagementData: z.string().min(10, { message: "Please describe member engagement." }),
  existingContent: z.string().optional(),
});

export function SuggestionForm() {
  const [suggestions, setSuggestions] = useState<ContentSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageType: "",
      currentTrends: "",
      memberEngagementData: "",
      existingContent: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await getContentSuggestions(values);
      setSuggestions(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to generate content suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Generate Content Ideas</CardTitle>
          <p className="text-sm text-muted-foreground pt-1">Fill in the details below to get AI-powered suggestions.</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a page type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="homepage">Homepage</SelectItem>
                        <SelectItem value="about">About Page</SelectItem>
                        <SelectItem value="event">Event Page</SelectItem>
                        <SelectItem value="services">Services Page</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentTrends"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Trends</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Rising interest in sustainable video production..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Trends in the cooperative and related fields.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberEngagementData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Engagement Data</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., High click-through on event posts..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Summary of member engagement with existing content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="existingContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existing Content (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste the current content of the page here..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : <> <Sparkles className="mr-2 h-4 w-4" /> Generate Suggestions</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-8 sticky top-24">
        {isLoading && (
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-40" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Skeleton className="h-6 w-6 rounded-full" />
                           <Skeleton className="h-6 w-48" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        )}

        {suggestions && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb /> Content Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {suggestions.contentIdeas.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles /> Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {suggestions.improvementSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {!suggestions && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                <div className="bg-accent/10 text-accent-foreground p-3 rounded-full mb-4">
                    <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold font-headline">AI suggestions will appear here</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">Fill out the form on the left to generate new content ideas and improvements.</p>
            </div>
        )}
      </div>
    </div>
  );
}
