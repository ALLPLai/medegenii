"use client"

import { cn } from "@/lib/utils"

interface GlowProps {
  variant?: "top" | "bottom" | "above" | "below"
  className?: string
}

export function Glow({ variant = "top", className }: GlowProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -z-10",
        {
          "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2": variant === "top",
          "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2": variant === "bottom",
          "left-1/2 top-0 -translate-x-1/2 -translate-y-3/4": variant === "above",
          "bottom-0 left-1/2 -translate-x-1/2 translate-y-3/4": variant === "below",
        },
        className
      )}
    >
      <div
        className="h-[300px] w-[600px] rounded-full opacity-30 blur-[120px] md:h-[400px] md:w-[800px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.35) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 80%)",
        }}
      />
    </div>
  )
}
