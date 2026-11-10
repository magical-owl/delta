import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-white",
  {
    variants: {
      variant: {
        default: "bg-[#4B8881] text-white hover:bg-[#386E69] shadow-xs",
        primary: "bg-[#4B8881] text-white hover:bg-[#386E69] shadow-xs",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
        outline: "border border-[#DFE6E2] bg-white text-[#192E32] hover:bg-slate-50",
        secondary: "bg-slate-100 text-[#192E32] hover:bg-slate-200",
        ghost: "hover:bg-slate-100 text-[#192E32]",
        icon: "h-10 w-10 p-0 text-[#758481] hover:text-[#192E32] hover:bg-slate-100",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
