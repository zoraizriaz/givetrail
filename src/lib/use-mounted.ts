"use client";

import { useEffect, useState } from "react";

/** True only after the client has mounted — use to defer rendering data that depends on runtime/localStorage overrides, avoiding SSR hydration mismatches. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
