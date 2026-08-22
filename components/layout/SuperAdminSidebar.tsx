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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile Top Header (Visible only on < md) ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-4 border-black bg-purple-300 px-4 py-2.5 md:hidden shadow-[0px_2px_0px_0px_#000]">
        <div className="flex items-center gap-2.5">
          <Image
            src="/image/logo.png"
            alt="Find My Career"
            width={120}
            height={120}
            className="h-10 w-auto object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-black leading-none">
              FIND MY CAREER
            </span>
            <span className="text-[9px] font-bold text-purple-950">
              Super Admin
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar (Desktop Fixed & Mobile Slide Drawer) ── */}
      <aside
        className={cn(
          "nb-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between bg-white p-5 transition-transform duration-200 ease-in-out md:static md:w-64 md:translate-x-0 md:min-h-screen",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="mb-5 border-b-2 border-black pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                <Image
                  src="/image/logo.png"
                  alt="Find My Career"
                  width={140}
                  height={140}
                  className="h-14 w-14 shrink-0 object-contain"
                  priority
                />
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tight text-black leading-tight uppercase">
                    Find My <span className="text-purple-700">Career</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                    Super Admin Portal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="border-2 border-black bg-white p-1 md:hidden shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Superadmin Badge */}
          <div className="mb-5 border-2 border-black bg-purple-200 p-2.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center gap-1.5 text-xs font-black text-purple-950">
              <ShieldCheck className="h-4 w-4 shrink-0 text-purple-700" />
              <span>PORTAL SUPER ADMIN</span>
            </div>
            <p className="mt-0.5 text-[10px] font-bold text-purple-800">
              Pengelola Sistem & Kemitraan
            </p>
          </div>

          <nav className="space-y-2.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 border-2 border-black bg-white px-3.5 py-2.5 font-black transition-colors hover:bg-purple-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                    isActive && "bg-yellow-300 hover:bg-yellow-300"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t-2 border-black pt-4">
          <div className="text-xs">
            <p className="font-black text-black">{user?.name}</p>
            <p className="truncate text-gray-600">{user?.email}</p>
          </div>
          <Button
            variant="plain"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>
    </>
  );
}
