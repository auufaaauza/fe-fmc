"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  GraduationCap,
  LogOut,
  Menu,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/superadmin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/superadmin/sekolah", label: "Sekolah Mitra", icon: Building2 },
  { href: "/superadmin/admin", label: "Verifikasi Guru BK", icon: UserCheck },
  { href: "/superadmin/siswa", label: "Data Semua Siswa", icon: Users },
  { href: "/admin/program-studi", label: "Program Studi & SAW", icon: GraduationCap },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150";
  const navLinkActive = "bg-indigo-50/80 text-indigo-700 shadow-sm shadow-indigo-500/10";
  const navLinkInactive = "text-slate-600 hover:bg-white/65 hover:text-slate-900";

  return (
    <>
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
            <span className="text-sm font-semibold leading-none text-slate-800">
              Find My Career
            </span>
            <span className="mt-0.5 text-[10px] text-slate-500">
              Super Admin
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

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "nb-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between p-5 transition-transform duration-200 ease-in-out md:static md:min-h-screen md:w-64 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
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
                <span className="text-sm font-semibold leading-tight text-slate-800">
                  Find My Career
                </span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Super Admin Portal
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-5 rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Portal Super Admin</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Pengelola sistem dan kemitraan sekolah
            </p>
          </div>

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

        <div className="space-y-3 border-t border-slate-100/80 pt-4">
          <div className="px-1 text-xs">
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="mt-0.5 truncate text-slate-500">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="flex w-full items-center justify-start gap-2 text-red-500 hover:bg-red-50/80 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>
    </>
  );
}
