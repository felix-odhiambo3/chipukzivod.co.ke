import { SuggestionForm } from "./suggestion-form";

export default function ContentSuggestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Content Suggestions</h1>
        <p className="text-muted-foreground">
          Use the power of AI to generate content ideas and improvements for your website pages based on trends and engagement data.
        </p>
      </div>
      <SuggestionForm />
    </div>
  );
}
