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
            "gradient-bg text-white hover:opacity-90": variant === "primary",
            "bg-brand-100 text-brand-900 hover:bg-brand-200 border border-brand-200": variant === "secondary",
            "border border-brand-400 text-brand-700 hover:bg-brand-50": variant === "outline",
            "text-brand-700 hover:text-brand-600 hover:bg-brand-50": variant === "ghost",
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
