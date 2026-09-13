"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: number;
}

/** Abstract ribbon "GT" mark echoing the GiveTrail brand — a looping G that folds into a T crossbar. */
export function LogoMark({ className, size = 32 }: LogoMarkProps) {
  const id = `gt-mark-gradient-${useId()}`;
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--trail-cream)" />
          <stop offset="40%" stopColor="var(--trail-blush)" />
          <stop offset="72%" stopColor="var(--trail-rose)" />
          <stop offset="100%" stopColor="var(--trail-peach)" />
        </linearGradient>
      </defs>
      <path
        d="M27 4.5A19.5 19.5 0 1 0 43 23.5h-9.5"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <path d="M22 23.5h16" stroke={`url(#${id})`} strokeWidth="6.5" strokeLinecap="round" />
      <path d="M30 23.5v18.5" stroke="var(--trail-brown)" strokeOpacity="0.85" strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markSize?: number;
  wordmarkClassName?: string;
}

export function Logo({ className, markSize = 30, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span className={cn("font-heading text-[1.35rem] font-semibold tracking-tight text-foreground", wordmarkClassName)}>
        Give<span className="text-primary">Trail</span>
      </span>
    </span>
  );
}
