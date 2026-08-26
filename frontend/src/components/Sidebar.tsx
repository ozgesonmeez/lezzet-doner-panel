"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  BarChart3,
  Bike,
  CalendarRange,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

const adminMenu = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Kurye Takip",
    href: "/kurye-takip",
    icon: Bike,
  },
  {
    label: "Günlük Kasa",
    href: "/gunluk-kasa",
    icon: WalletCards,
  },
  {
    label: "Veresiye",
    href: "/veresiye",
    icon: CircleDollarSign,
  },
  {
    label: "Ay Sonu",
    href: "/ay-sonu",
    icon: CalendarRange,
  },
  {
    label: "Raporlar",
    href: "/raporlar",
    icon: BarChart3,
  },
  {
    label: "Ayarlar",
    href: "/ayarlar",
    icon: Settings,
  },
];

const paketciMenu = [
  {
    label: "Kurye Takip",
    href: "/kurye-takip",
    icon: Bike,
  },
];

export default function Sidebar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    user,
    logout,
  } = useAuth();

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user) {
    return null;
  }

  const menu =
    user.role === "ADMIN"
      ? adminMenu
      : paketciMenu;

  function isActive(
    href: string
  ) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  function handleLogout() {
    logout();

    router.replace(
      "/login"
    );
  }

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div>
          <p className="text-sm font-black text-[#082d4e]">
            LEZZET DÖNER
          </p>

          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-orange-500">
            Yönetim Paneli
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#082d4e] text-white"
          aria-label="Menüyü aç"
        >
          <Menu size={21} />
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {open && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() =>
            setOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col bg-[#082d4e] text-white shadow-2xl transition-transform duration-200 lg:w-[240px] lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div>
            <p className="text-lg font-black">
              LEZZET DÖNER
            </p>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">
              Yönetim Paneli
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(false)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* USER */}
        <div className="mx-4 mt-5 rounded-2xl bg-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500">
              <UserRound
                size={19}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {user.fullName}
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-300">
                {user.role ===
                "ADMIN"
                  ? "Yönetici"
                  : "Paket Personeli"}
              </p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Menü
          </p>

          <div className="space-y-1">
            {menu.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.href
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                      active
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={19}
                    />

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut size={19} />

            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}