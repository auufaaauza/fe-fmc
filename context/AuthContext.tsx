"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, TOKEN_KEY } from "@/lib/axios";
import type { Progress, Role, User } from "@/types";

interface RegisterStudentData {
  name: string;
  nisn: string;
  email?: string;
  class: string;
  origin_school?: string;
  school_id?: number;
  password: string;
  password_confirmation: string;
}

interface AuthContextValue {
  user: User | null;
  progress: Progress | null;
  loading: boolean;
  login: (identifier: string, password: string, role?: Role) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  registerStudent: (data: RegisterStudentData) => Promise<string>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshMe = useCallback(async () => {
    try {
      // Only attempt if token exists in localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      if (!token) {
        setUser(null);
        setProgress(null);
        return;
      }
      const response = await api.get("/me");
      setUser(response.data.user);
      setProgress(response.data.progress);
    } catch {
      // Token invalid or expired — clear it
      if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (identifier: string, password: string, role?: Role) => {
      const trimmed = identifier.trim();
      const determinedRole: Role = role || (trimmed.includes("@") ? "admin" : "student");

      const payload = {
        role: determinedRole,
        identifier: trimmed,
        password,
      };

      try {
        const response = await api.post("/login", payload);
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, response.data.token);
        }
        const loggedUser = response.data.user;
        setUser(loggedUser);
        setProgress(response.data.progress);

        if (loggedUser.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch (error: any) {
        // If initial attempt with admin role failed and user entered an email,
        // retry as student in case the student account was registered with email
        if (determinedRole === "admin" && !role) {
          try {
            const retryResponse = await api.post("/login", {
              role: "student",
              identifier: trimmed,
              password,
            });
            if (typeof window !== "undefined") {
              localStorage.setItem(TOKEN_KEY, retryResponse.data.token);
            }
            const loggedUser = retryResponse.data.user;
            setUser(loggedUser);
            setProgress(retryResponse.data.progress);
            router.push("/dashboard");
            return;
          } catch {
            // Keep original error if retry also fails
          }
        }
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } finally {
      // Remove token from localStorage
      if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setProgress(null);
      router.push("/login");
    }
  }, [router]);

  const registerStudent = useCallback(async (data: RegisterStudentData): Promise<string> => {
    const response = await api.post("/register", { ...data, role: "student" });
    return response.data.message;
  }, []);

  const value = useMemo(
    () => ({ user, progress, loading, login, logout, refreshMe, registerStudent }),
    [user, progress, loading, login, logout, refreshMe, registerStudent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
