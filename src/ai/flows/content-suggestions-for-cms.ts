'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating content suggestions for CMS pages.
 *
 * The flow takes current trends and member engagement data as input and returns content ideas and improvements.
 * It exports:
 *   - `generateContentSuggestions`: The main function to trigger the content suggestion flow.
 *   - `ContentSuggestionsInput`: The input type for the flow.
 *   - `ContentSuggestionsOutput`: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentSuggestionsInputSchema = z.object({
  currentTrends: z.string().describe('Current trends in the cooperative and related fields.'),
  memberEngagementData: z.string().describe('Data on member engagement with existing content.'),
  pageType: z.string().describe('The type of CMS page (e.g., homepage, about page, event page).'),
  existingContent: z.string().optional().describe('The existing content of the page, if any.'),
});

export type ContentSuggestionsInput = z.infer<typeof ContentSuggestionsInputSchema>;

const ContentSuggestionsOutputSchema = z.object({
  contentIdeas: z.array(z.string()).describe('A list of content ideas for the CMS page.'),
  improvementSuggestions: z.array(z.string()).describe('A list of suggestions for improving existing content.'),
});

export type ContentSuggestionsOutput = z.infer<typeof ContentSuggestionsOutputSchema>;

export async function generateContentSuggestions(input: ContentSuggestionsInput): Promise<ContentSuggestionsOutput> {
  return contentSuggestionsFlow(input);
}

const contentSuggestionsPrompt = ai.definePrompt({
  name: 'contentSuggestionsPrompt',
  input: {schema: ContentSuggestionsInputSchema},
  output: {schema: ContentSuggestionsOutputSchema},
  prompt: `You are a content strategist for Chipukizi VOD Worker Cooperative.
  Based on the current trends and member engagement data, suggest content ideas and improvements for the given CMS page type.

  Page Type: {{{pageType}}}
  Current Trends: {{{currentTrends}}}
  Member Engagement Data: {{{memberEngagementData}}}
  Existing Content: {{{existingContent}}}

  Provide content ideas that are relevant to the cooperative's mission and values.
  Suggest improvements to the existing content to make it more engaging and informative.

  Format your output as a JSON object with 'contentIdeas' and 'improvementSuggestions' fields.`,
});

const contentSuggestionsFlow = ai.defineFlow(
  {
    name: 'contentSuggestionsFlow',
    inputSchema: ContentSuggestionsInputSchema,
    outputSchema: ContentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await contentSuggestionsPrompt(input);
    return output!;
  }
);
