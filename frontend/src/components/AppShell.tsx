"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LoaderCircle,
} from "lucide-react";

import Sidebar from "./Sidebar";

import {
  useAuth,
} from "@/context/AuthContext";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    user,
    loading,
  } = useAuth();

  const isLoginPage =
    pathname === "/login";

  const isCourierPage =
    pathname ===
      "/kurye-takip" ||
    pathname.startsWith(
      "/kurye-takip/"
    );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      isLoginPage &&
      user
    ) {
      router.replace(
        user.role ===
          "PAKETCI"
          ? "/kurye-takip"
          : "/"
      );

      return;
    }

    if (
      !isLoginPage &&
      !user
    ) {
      router.replace(
        "/login"
      );

      return;
    }

    if (
      user?.role ===
        "PAKETCI" &&
      !isCourierPage
    ) {
      router.replace(
        "/kurye-takip"
      );
    }
  }, [
    loading,
    user,
    pathname,
    router,
    isLoginPage,
    isCourierPage,
  ]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (
    loading ||
    !user
  ) {
    return <LoadingScreen />;
  }

  if (
    user.role ===
      "PAKETCI" &&
    !isCourierPage
  ) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Sidebar />

      <div className="min-h-screen pt-16 lg:ml-[240px] lg:pt-0">
        {children}
      </div>
    </>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
      <div className="text-center">
        <LoaderCircle
          size={34}
          className="mx-auto animate-spin text-orange-500"
        />

        <p className="mt-3 text-sm text-slate-500">
          Yükleniyor...
        </p>
      </div>
    </main>
  );
}