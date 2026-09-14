"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The site's one recurring ambient object: a soft, heavily-blurred glow
 * drifting almost imperceptibly. Pure CSS/SVG gradient material — no WebGL —
 * per the performance-first requirement. Purely decorative (aria-hidden).
 */
export function HeroGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <motion.div
        className="trail-glow absolute left-1/2 top-[-10%] size-[64rem] rounded-full opacity-70"
        style={{ x: "-50%" }}
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.05, 1],
                rotate: [0, 6, 0],
              }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
