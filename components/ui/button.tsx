"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "danger" | "plain" | "outline";
  size?: "default" | "sm" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        variant === "primary" && "nb-btn-primary",
        variant === "danger" && "nb-btn-danger",
        (variant === "plain" || variant === "outline") &&
          "border-2 border-black bg-white px-4 py-2 font-black uppercase transition-colors hover:bg-gray-100",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-6 py-3 text-base",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
