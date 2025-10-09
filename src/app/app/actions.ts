'use server';

import { generateContentSuggestions, type ContentSuggestionsInput, type ContentSuggestionsOutput } from "@/ai/flows/content-suggestions-for-cms";

export async function getContentSuggestions(input: ContentSuggestionsInput): Promise<ContentSuggestionsOutput> {
  try {
    const suggestions = await generateContentSuggestions(input);
    if (!suggestions.contentIdeas || !suggestions.improvementSuggestions) {
      throw new Error("AI returned an invalid response.");
    }
    return suggestions;
  } catch (error) {
    console.error("Error in getContentSuggestions server action:", error);
    // In a real app, you might want to log this to a service like Sentry
    throw new Error("Failed to generate suggestions from AI flow. Please check the inputs and try again.");
  }
}
