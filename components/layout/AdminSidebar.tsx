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

  // Check if current route is inside student/class management
  const isStudentSectionActive =
    pathname.startsWith("/admin/siswa") || pathname.startsWith("/admin/kelas");

  const [studentDropdownOpen, setStudentDropdownOpen] = useState(true);

  // Auto-expand dropdown when navigating into one of its subpages
  useEffect(() => {
    if (isStudentSectionActive) {
      setStudentDropdownOpen(true);
    }
  }, [pathname, isStudentSectionActive]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile Top Header (Visible only on < md) ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-4 border-black bg-yellow-400 px-4 py-2.5 md:hidden shadow-[0px_2px_0px_0px_#000]">
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
            <span className="text-[9px] font-bold text-gray-800">
              Portal Guru BK
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
                    Find My <span className="text-pink-600">Career</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                    Portal Guru BK
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

          {/* School Info Badge */}
          {user?.school && (
            <div className="mb-5 border-2 border-black bg-yellow-100 p-2.5 shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center gap-1.5 text-xs font-black text-black">
                <SchoolIcon className="h-4 w-4 shrink-0 text-pink-600" />
                <span className="truncate">{user.school.name}</span>
              </div>
              {user.school.city && (
                <p className="mt-1 flex items-center text-[10px] font-bold text-gray-700">
                  <MapPin className="h-3 w-3 shrink-0 text-pink-600 mr-1" />
                  <span>{user.school.city}</span>
                </p>
              )}
            </div>
          )}

          <nav className="space-y-2.5">
            {/* Dashboard */}
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-3 border-2 border-black bg-white px-3 py-2.5 font-black transition-colors hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                pathname === "/admin/dashboard" && "bg-pink-300 hover:bg-pink-300"
              )}
            >
              <BarChart3 className="h-5 w-5 shrink-0" />
              Dashboard
            </Link>

            {/* Collapsible Dropdown: Siswa & Kelas */}
            <div className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
              <button
                type="button"
                onClick={() => setStudentDropdownOpen((prev) => !prev)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 font-black transition-colors hover:bg-yellow-100",
                  isStudentSectionActive && !studentDropdownOpen && "bg-yellow-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 shrink-0 text-black" />
                  <span>Kelola Siswa</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    studentDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Submenu Links */}
              {studentDropdownOpen && (
                <div className="space-y-1 border-t-2 border-black bg-yellow-50/70 p-2">
                  <Link
                    href="/admin/siswa"
                    className={cn(
                      "flex items-center gap-2 border-2 border-transparent px-2.5 py-1.5 text-xs font-black transition-colors hover:border-black hover:bg-white",
                      pathname === "/admin/siswa" &&
                        "border-black bg-pink-300 hover:bg-pink-300"
                    )}
                  >
                    <UserCheck className="h-4 w-4 shrink-0 text-gray-700" />
                    <span>Daftar Siswa</span>
                  </Link>

                  <Link
                    href="/admin/kelas"
                    className={cn(
                      "flex items-center gap-2 border-2 border-transparent px-2.5 py-1.5 text-xs font-black transition-colors hover:border-black hover:bg-white",
                      pathname === "/admin/kelas" &&
                        "border-black bg-pink-300 hover:bg-pink-300"
                    )}
                  >
                    <Layers className="h-4 w-4 shrink-0 text-gray-700" />
                    <span>Kelola Kelas</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Program Studi */}
            <Link
              href="/admin/program-studi"
              className={cn(
                "flex items-center gap-3 border-2 border-black bg-white px-3 py-2.5 font-black transition-colors hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                pathname === "/admin/program-studi" &&
                  "bg-pink-300 hover:bg-pink-300"
              )}
            >
              <GraduationCap className="h-5 w-5 shrink-0" />
              Program Studi
            </Link>
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
