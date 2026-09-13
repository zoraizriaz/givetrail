import Image from "next/image";
import { cn } from "@/lib/utils";

// Source mark is 1254x722.
const MARK_ASPECT_RATIO = 1254 / 722;

interface LogoMarkProps {
  className?: string;
  size?: number;
}

/** The GiveTrail "GT" ribbon mark. */
export function LogoMark({ className, size = 32 }: LogoMarkProps) {
  return (
    <Image
      src="/logo.png"
      alt="GiveTrail"
      width={Math.round(size * MARK_ASPECT_RATIO)}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      style={{ height: size, width: "auto" }}
      priority
    />
  );
}

interface LogoProps {
  className?: string;
  markSize?: number;
  wordmarkClassName?: string;
}

export function Logo({ className, markSize = 30, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={markSize} />
      <span className={cn("font-heading text-[1.35rem] font-semibold tracking-tight text-foreground", wordmarkClassName)}>
        Give<span className="text-primary">Trail</span>
      </span>
    </span>
  );
}
