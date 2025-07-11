"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

interface ScrollRevealOptions {
  once?: boolean;
  margin?: string;
}

export function useScrollReveal(options: ScrollRevealOptions = { once: true, margin: "-20% 0px" }) {
  const ref = useRef(null);
  // Framer Motion's useInView expects margin to be a specific type, but our API provides string.
  // TypeScript doesn't allow string here, but Framer Motion does at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inView = useInView(ref, { ...options, margin: options.margin as any });
  return [ref, inView] as const;
} 