"use client"

import { cn } from "@/lib/utils"

interface MockupProps {
  children: React.ReactNode
  className?: string
  type?: "browser" | "phone"
}

export function Mockup({ children, className, type = "browser" }: MockupProps) {
  if (type === "phone") {
    return (
      <div
        className={cn(
          "relative mx-auto w-[280px] rounded-[2.5rem] border-[8px] border-white/[0.08] bg-black p-1 shadow-2xl",
          className
        )}
      >
        <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-black" />
        <div className="overflow-hidden rounded-[2rem]">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f0f13] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      {/* Browser bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-white/[0.08]" />
          <div className="size-2.5 rounded-full bg-white/[0.08]" />
          <div className="size-2.5 rounded-full bg-white/[0.08]" />
        </div>
        <div className="mx-auto flex h-5 w-56 items-center justify-center rounded-md bg-white/[0.04] px-3 text-[10px] text-white/20">
          medgenii.app/dashboard
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
