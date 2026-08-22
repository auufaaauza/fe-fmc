"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "danger" | "plain" | "outline" | "glass" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
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
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20",
        variant === "danger" &&
          "bg-red-500 text-white shadow-sm shadow-red-500/20 hover:bg-red-600 hover:shadow-md hover:shadow-red-500/20",
        variant === "plain" &&
          "border border-white/70 bg-white/65 text-slate-700 shadow-sm backdrop-blur-md hover:border-white hover:bg-white/85",
        variant === "outline" &&
          "border border-slate-200/80 bg-white/30 text-slate-700 backdrop-blur-md hover:border-white hover:bg-white/70",
        variant === "ghost" &&
          "bg-transparent text-slate-600 hover:bg-white/55 hover:text-slate-900",
        variant === "glass" && [
          "border text-slate-700",
          "[background:rgba(255,255,255,0.66)]",
          "[backdrop-filter:blur(16px)_saturate(140%)]",
          "[-webkit-backdrop-filter:blur(16px)_saturate(140%)]",
          "[border-color:rgba(255,255,255,0.78)]",
          "[box-shadow:0_8px_28px_rgba(31,41,55,0.06),inset_0_1px_0_rgba(255,255,255,0.86)]",
          "hover:[background:rgba(255,255,255,0.84)]",
          "hover:[box-shadow:0_18px_50px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.94)]",
        ],
        size === "default" && "px-4 py-2 text-sm",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "lg" && "px-5 py-2.5 text-base",
        size === "icon" && "h-9 w-9 p-2",
        className
      )}
      {...props}
    />
  );
}
