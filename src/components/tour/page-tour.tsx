"use client";

import { Sparkles } from "lucide-react";
import { usePageTour } from "./use-page-tour";
import { TourOverlay } from "./tour-overlay";
import type { TourStep } from "./types";

/**
 * Drop this into any page to give it a self-contained guided tour: it
 * auto-plays once per visitor on first visit, and leaves behind a small
 * "Take a tour" button so they can replay it anytime.
 */
export function PageTour({ tourId, steps }: { tourId: string; steps: TourStep[] }) {
  const tour = usePageTour(tourId, steps);

  return (
    <>
      <TourOverlay {...tour} />
      {!tour.active && (
        <button
          onClick={tour.start}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <Sparkles className="size-3.5 text-primary" />
          Take a tour
        </button>
      )}
    </>
  );
}
