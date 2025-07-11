"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function useReducedMotion() {
  const prefersReduced = useFramerReducedMotion();
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      setFallback(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);
  return prefersReduced || fallback;
} 