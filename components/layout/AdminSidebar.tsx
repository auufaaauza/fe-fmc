"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  GraduationCap,
  Layers,
  LogOut,
  MapPin,
  Menu,
  School as SchoolIcon,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStudentSectionActive =
    pathname.startsWith("/admin/siswa") || pathname.startsWith("/admin/kelas");

  const [studentDropdownOpen, setStudentDropdownOpen] = useState(true);

  useEffect(() => {
    if (isStudentSectionActive) {
      setStudentDropdownOpen(true);
    }
  }, [pathname, isStudentSectionActive]);

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
              Portal Guru BK
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
                  Portal Guru BK
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

          {/* School Info */}
          {user?.school && (
            <div className="mb-5 rounded-lg border border-white/70 bg-white/55 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <SchoolIcon className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span className="truncate">{user.school.name}</span>
              </div>
              {user.school.city && (
                <p className="mt-1 flex items-center text-[10px] text-slate-500 gap-1">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                  <span>{user.school.city}</span>
                </p>
              )}
            </div>
          )}

          <nav className="space-y-1">
            {/* Dashboard */}
            <Link
              href="/admin/dashboard"
              className={cn(
                navLinkBase,
                pathname === "/admin/dashboard" ? navLinkActive : navLinkInactive
              )}
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              Dashboard
            </Link>

            {/* Kelola Siswa Dropdown */}
            <div className="rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setStudentDropdownOpen((prev) => !prev)}
                className={cn(
                  navLinkBase,
                  "w-full justify-between",
                  isStudentSectionActive && !studentDropdownOpen ? navLinkActive : navLinkInactive
                )}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Kelola Siswa</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    studentDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {studentDropdownOpen && (
                <div className="ml-3 mt-1 space-y-0.5 pl-4 border-l border-slate-200">
                  <Link
                    href="/admin/siswa"
                    className={cn(
                      navLinkBase, "text-xs",
                      pathname === "/admin/siswa" ? navLinkActive : navLinkInactive
                    )}
                  >
                    <UserCheck className="h-3.5 w-3.5 shrink-0" />
                    Daftar Siswa
                  </Link>
                  <Link
                    href="/admin/kelas"
                    className={cn(
                      navLinkBase, "text-xs",
                      pathname === "/admin/kelas" ? navLinkActive : navLinkInactive
                    )}
                  >
                    <Layers className="h-3.5 w-3.5 shrink-0" />
                    Kelola Kelas
                  </Link>
                </div>
              )}
            </div>

            {/* Program Studi */}
            <Link
              href="/admin/program-studi"
              className={cn(
                navLinkBase,
                pathname === "/admin/program-studi" ? navLinkActive : navLinkInactive
              )}
            >
              <GraduationCap className="h-4 w-4 shrink-0" />
              Program Studi
            </Link>
          </nav>
        </div>

        {/* User Footer */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="text-xs px-1">
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-slate-500 mt-0.5">{user?.email}</p>
          </div>
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
