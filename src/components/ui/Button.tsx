import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "gradient-bg text-heritage-950 shadow-lg shadow-gold-500/15 hover:opacity-90 border border-gold-400/20": variant === "primary",
            "bg-heritage-800 text-heritage-50 hover:bg-heritage-700 border border-gold-500/10": variant === "secondary",
            "border border-gold-500/30 text-gold-300 hover:bg-gold-500/10": variant === "outline",
            "text-heritage-200/70 hover:text-gold-300 hover:bg-gold-500/5": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-sm": size === "md",
            "px-8 py-4 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
