"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
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
  login: (role: Role, identifier: string, password: string) => Promise<void>;
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
      const response = await api.get("/me");
      setUser(response.data.user);
      setProgress(response.data.progress);
    } catch {
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
    async (role: Role, identifier: string, password: string) => {
      const response = await api.post("/login", { role, identifier, password });
      setUser(response.data.user);
      setProgress(response.data.progress);

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } finally {
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
