import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
       <Image src="/images/IMG-20250616-WA0030.svg" alt="Chipukizi logo" width={120} height={40} className="h-10 w-auto" />
    </div>
  );
}
