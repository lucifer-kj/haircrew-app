import { Viewport } from "next";

// Shared viewport configuration for all pages
export const sharedViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#9929EA",
  colorScheme: "light dark",
};

// Function to generate page-specific viewport with optional overrides
export function createViewport(overrides?: Partial<Viewport>): Viewport {
  return {
    ...sharedViewport,
    ...overrides,
  };
} 