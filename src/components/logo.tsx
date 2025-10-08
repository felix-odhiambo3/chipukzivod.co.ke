import { cn } from "@/lib/utils";
import { Film } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-bold font-headline", className)}>
      <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
        <Film className="h-5 w-5" />
      </div>
      <span className="text-primary">Chipukizi</span>
      <span className="text-foreground">Hub</span>
    </div>
  );
}
