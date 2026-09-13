"use client";

import { useCallback, useEffect, useState } from "react";
import type { TourStep } from "./types";

function storageKey(tourId: string) {
  return `givetrail:tour-seen:${tourId}`;
}

export interface PageTourState {
  active: boolean;
  step: TourStep | null;
  index: number;
  total: number;
  rect: DOMRect | null;
  next: () => void;
  back: () => void;
  skip: () => void;
  start: () => void;
}

/**
 * Drives a single-page guided tour: auto-starts once per browser (per tourId)
 * on first visit, tracks the current step's target element position, and
 * exposes controls a <TourOverlay> can render. Call `start()` from a "Take a
 * tour" button to let visitors replay it anytime.
 */
export function usePageTour(tourId: string, steps: TourStep[]): PageTourState {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Auto-start on first visit to this page's tour.
  useEffect(() => {
    let seen = true;
    try {
      seen = window.localStorage.getItem(storageKey(tourId)) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    const timer = setTimeout(() => setActive(true), 700);
    return () => clearTimeout(timer);
  }, [tourId]);

  const measure = useCallback(() => {
    const step = steps[index];
    if (!step) {
      setRect(null);
      return;
    }
    const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`);
    const el = Array.from(candidates).find((c) => c.offsetParent !== null) ?? candidates[0];
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
  }, [index, steps]);

  useEffect(() => {
    if (!active) return;
    measure();
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [active, measure]);

  const finish = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey(tourId), "1");
    } catch {
      // ignore
    }
    setActive(false);
    setIndex(0);
    setRect(null);
  }, [tourId]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= steps.length) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  return {
    active,
    step: steps[index] ?? null,
    index,
    total: steps.length,
    rect,
    next,
    back,
    skip: finish,
    start,
  };
}
