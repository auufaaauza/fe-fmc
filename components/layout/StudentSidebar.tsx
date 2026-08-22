"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  School,
  Trophy,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/rapor", label: "Nilai Rapor", icon: BookOpenCheck },
  { href: "/questionnaire", label: "Kuesioner Minat", icon: ClipboardList },
  { href: "/hasil", label: "Hasil Rekomendasi", icon: Trophy },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150";
  const navLinkActive = "bg-indigo-50 text-indigo-700";
  const navLinkInactive = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header className="nb-header sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src="/image/logo.png"
            alt="Find My Career"
            width={120}
            height={120}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 leading-none">
              Find My Career
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Portal Siswa
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/70"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "nb-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between p-5 transition-transform duration-200 ease-in-out md:static md:w-64 md:translate-x-0 md:min-h-screen",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/image/logo.png"
                alt="Find My Career"
                width={140}
                height={140}
                className="h-10 w-10 shrink-0 object-contain"
                priority
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  Find My Career
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
                  Portal Siswa
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Student Info */}
          {user && (
            <div className="mb-5 rounded-lg border border-white/70 bg-white/55 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-500">
                    NISN: {user.nisn || "-"} / {user.class || "-"}
                  </p>
                </div>
              </div>
              {user.school && (
                <div className="mt-2 flex items-center gap-1 border-t border-slate-200 pt-1.5 text-[10px] text-slate-500">
                  <School className="h-3 w-3 shrink-0 text-indigo-400" />
                  <span className="truncate">{user.school.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Nav Links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(navLinkBase, isActive ? navLinkActive : navLinkInactive)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 pt-4">
          <Button
            variant="ghost"
            onClick={logout}
            className="flex w-full items-center justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>
    </>
  );
}
