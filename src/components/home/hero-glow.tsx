"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The site's one recurring ambient object: a soft, translucent, pearl-white
 * ribbon that traces a slow flowing path behind the hero, with the faintest
 * iridescent hint of the GT accent colors along its length. Pure SVG/CSS —
 * no WebGL — per the performance-first requirement. Purely decorative.
 */
export function HeroGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Soft radial atmosphere, unifies the section's background tone */}
      <motion.div
        className="trail-glow absolute left-1/2 top-[-14%] size-[64rem] rounded-full opacity-60"
        style={{ x: "-50%" }}
        animate={reduceMotion ? undefined : { scale: [1, 1.05, 1], rotate: [0, 6, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The flowing pearl ribbon */}
      <motion.svg
        viewBox="0 0 1400 700"
        className="absolute left-1/2 top-[-6%] h-[46rem] w-[110rem] max-w-none opacity-90"
        style={{ x: "-50%" }}
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["-50%", "-49%", "-50%"],
                y: [0, -14, 0],
                rotate: [0, 1.2, 0],
              }
        }
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="pearlBase" x1="0%" y1="0%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="pearlIridescence" x1="0%" y1="0%" x2="100%" y2="40%">
            <stop offset="0%" stopColor="var(--accent-ice)" stopOpacity="0.55" />
            <stop offset="35%" stopColor="var(--accent-lavender)" stopOpacity="0.45" />
            <stop offset="65%" stopColor="var(--accent-blush)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent-champagne)" stopOpacity="0.45" />
          </linearGradient>
          <filter id="pearlBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
        </defs>

        <g filter="url(#pearlBlur)">
          <path
            d="M -100 420 C 220 220, 460 560, 760 340 S 1240 160, 1500 300"
            fill="none"
            stroke="url(#pearlBase)"
            strokeWidth="150"
            strokeLinecap="round"
          />
          <motion.path
            d="M -100 420 C 220 220, 460 560, 760 340 S 1240 160, 1500 300"
            fill="none"
            stroke="url(#pearlIridescence)"
            strokeWidth="70"
            strokeLinecap="round"
            strokeDasharray="90 140"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -460] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />
        </g>
      </motion.svg>
    </div>
  );
}
