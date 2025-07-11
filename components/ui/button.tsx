import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "default", size = "default", asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        {...props}
        className={cn(
          "min-h-[44px] rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-secondary transition-all",
          "text-base sm:text-lg",
          
          // Handle variants
          variant === "default" && "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]",
          variant === "destructive" && "bg-red-500 text-white hover:bg-red-600",
          variant === "outline" && "border border-gray-300 bg-transparent hover:bg-gray-100",
          variant === "secondary" && "bg-gray-200 text-gray-800 hover:bg-gray-300",
          variant === "ghost" && "bg-transparent hover:bg-gray-100",
          variant === "link" && "bg-transparent text-[var(--primary)] underline-offset-4 hover:underline",
          
          // Handle sizes
          size === "default" && "px-4 py-2",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "lg" && "px-6 py-3",
          size === "icon" && "p-2 min-w-[44px] aspect-square",
          
          className
        )}
      />
    );
  }
);

// Global Loader Spinner
export function Loader({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`inline-block animate-spin rounded-full border-4 border-solid border-secondary border-t-transparent ${className}`} role="status" aria-label="Loading" />
  );
}
