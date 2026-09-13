"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageTourState } from "./use-page-tour";

const PADDING = 8;
const CARD_WIDTH = 320;
const CARD_HEIGHT_ESTIMATE = 190;
const GAP = 14;

export function TourOverlay(tour: PageTourState) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !tour.active || !tour.step) return null;

  const { rect, step, index, total, next, back, skip } = tour;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 768;

  let cardStyle: React.CSSProperties;
  if (rect) {
    const placement = step.placement ?? "bottom";
    let top = rect.bottom + GAP;
    let left = rect.left;
    if (placement === "top") top = rect.top - CARD_HEIGHT_ESTIMATE - GAP;
    if (placement === "left") {
      top = rect.top;
      left = rect.left - CARD_WIDTH - GAP;
    }
    if (placement === "right") {
      top = rect.top;
      left = rect.right + GAP;
    }
    left = Math.min(Math.max(left, 16), viewportW - CARD_WIDTH - 16);
    top = Math.min(Math.max(top, 16), viewportH - CARD_HEIGHT_ESTIMATE - 16);
    cardStyle = { left, top };
  } else {
    cardStyle = {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-2xl transition-all duration-300 ease-out"
          style={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(42, 33, 28, 0.6)",
            outline: "2px solid var(--primary)",
            outlineOffset: "2px",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[rgba(42,33,28,0.6)]" onClick={skip} />
      )}

      <div
        className="fixed z-[101] max-h-[80vh] w-[320px] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl"
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Step {index + 1} of {total}
          </span>
          <button onClick={skip} aria-label="Close tour" className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <h3 className="mt-2 font-heading text-base font-semibold text-foreground">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={skip} className="text-muted-foreground">
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" onClick={back}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {index + 1 >= total ? "Done" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
