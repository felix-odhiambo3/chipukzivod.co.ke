
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
       <Image src="/images/IMG-20250616-WA0030.svg" alt="Chipukizi logo" width="0" height="0" sizes="100vw" className="h-10 w-auto" />
    </div>
  );
}
