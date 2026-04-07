"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { getSpecialtyLabel } from "@/config/specialties"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/appointments", label: "Rendez-vous", icon: Calendar },
  { href: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 text-slate-400 hover:text-red-600 hover:bg-red-50"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </Button>
  )
}

export function Sidebar({ doctorName, doctorSpecialty }: { doctorName: string; doctorSpecialty: string }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-4">
        <Logo size={28} />
        <Link href="/dashboard" className="text-[15px] font-bold text-slate-900">
          Medgenii
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <NavLinks />
        <div className="space-y-1">
          <div className="rounded-lg bg-violet-50/60 px-3 py-2.5">
            <p className="truncate text-[13px] font-medium text-slate-700">
              {doctorName}
            </p>
            <p className="truncate text-[11px] text-violet-600/70">
              {getSpecialtyLabel(doctorSpecialty)}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}

export function MobileNav({ doctorName, doctorSpecialty }: { doctorName: string; doctorSpecialty: string }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Logo size={24} />
        <span className="text-[15px] font-bold text-slate-900">Medgenii</span>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-violet-50 hover:text-violet-700 h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <Logo size={28} />
            <SheetTitle className="text-[15px] font-bold text-slate-900">Medgenii</SheetTitle>
          </div>
          <div className="flex flex-1 flex-col justify-between h-[calc(100%-3rem)]">
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="space-y-1">
              <div className="rounded-lg bg-violet-50/60 px-3 py-2.5">
                <p className="truncate text-[13px] font-medium text-slate-700">
                  {doctorName}
                </p>
                <p className="truncate text-[11px] text-violet-600/70">
                  {getSpecialtyLabel(doctorSpecialty)}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
