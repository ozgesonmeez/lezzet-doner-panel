"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  Bike,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Package,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";

import {
  getDailyCash,
  getMonthlySummary,
  getReport,
  getTodayCouriers,
  type Courier,
  type DailyCash,
  type MonthlySummary,
  type Report,
} from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

/* =========================================================
   DATE HELPERS
========================================================= */

function toDateInputValue(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function getToday() {
  return toDateInputValue(
    new Date()
  );
}

function getCurrentMonth() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}`;
}

function getLastSevenDaysStart() {
  const date =
    new Date();

  date.setDate(
    date.getDate() - 6
  );

  return toDateInputValue(
    date
  );
}

/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "tr-TR",
    {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }
  ).format(value);
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      `${value}T12:00:00`
    )
  );
}

function formatShortDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(
    new Date(
      `${value}T12:00:00`
    )
  );
}

function formatMonth(
  value: string
) {
  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      `${value}-01T12:00:00`
    )
  );
}

function getInitials(
  fullName: string
) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase()
    )
    .join("");
}

/* =========================================================
   PAGE
========================================================= */

export default function Home() {
  const { user } =
    useAuth();

  const [
    dailyCash,
    setDailyCash,
  ] =
    useState<DailyCash | null>(
      null
    );

  const [
    couriers,
    setCouriers,
  ] =
    useState<Courier[]>([]);

  const [
    monthlySummary,
    setMonthlySummary,
  ] =
    useState<MonthlySummary | null>(
      null
    );

  const [
    weeklyReport,
    setWeeklyReport,
  ] =
    useState<Report | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadDashboard =
    useCallback(
      async () => {
        const today =
          getToday();

        const month =
          getCurrentMonth();

        const weekStart =
          getLastSevenDaysStart();

        try {
          setLoading(true);
          setError(null);

          const [
            dailyData,
            courierData,
            monthlyData,
            weeklyData,
          ] =
            await Promise.all([
              getDailyCash(
                today
              ),

              getTodayCouriers(),

              getMonthlySummary(
                month
              ),

              getReport(
                weekStart,
                today
              ),
            ]);

          setDailyCash(
            dailyData
          );

          setCouriers(
            courierData
          );

          setMonthlySummary(
            monthlyData
          );

          setWeeklyReport(
            weeklyData
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Dashboard bilgileri yüklenemedi."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    if (!user) {
      return;
    }

    if (
      user.role !== "ADMIN"
    ) {
      setLoading(false);
      return;
    }

    void loadDashboard();
  }, [
    user,
    loadDashboard,
  ]);

  const activeCouriers =
    useMemo(
      () =>
        couriers.filter(
          (courier) =>
            courier.active
        ),
      [couriers]
    );

  const totalPackageCount =
    useMemo(
      () =>
        couriers.reduce(
          (
            total,
            courier
          ) =>
            total +
            courier.packageCount,
          0
        ),
      [couriers]
    );

  const totalPackageAmount =
    useMemo(
      () =>
        couriers.reduce(
          (
            total,
            courier
          ) =>
            total +
            courier.totalAmount,
          0
        ),
      [couriers]
    );

  const topCourier =
    useMemo(() => {
      const candidates =
        couriers.filter(
          (courier) =>
            courier.packageCount >
            0
        );

      if (
        candidates.length ===
        0
      ) {
        return null;
      }

      return [
        ...candidates,
      ].sort(
        (a, b) =>
          b.packageCount -
          a.packageCount
      )[0];
    }, [couriers]);

  const courierList =
    useMemo(
      () =>
        [...couriers]
          .sort(
            (a, b) => {
              if (
                a.active !==
                b.active
              ) {
                return Number(
                  b.active
                ) -
                  Number(
                    a.active
                  );
              }

              return (
                b.packageCount -
                a.packageCount
              );
            }
          )
          .slice(
            0,
            6
          ),
      [couriers]
    );

  const salesChannels =
    useMemo(() => {
      const totals =
        new Map<
          string,
          number
        >();

      dailyCash?.incomes.forEach(
        (income) => {
          const channel =
            income.channel?.trim() ||
            "Diğer";

          totals.set(
            channel,
            (totals.get(
              channel
            ) || 0) +
              income.amount
          );
        }
      );

      return Array.from(
        totals.entries()
      )
        .map(
          ([
            name,
            amount,
          ]) => ({
            name,
            amount,
          })
        )
        .sort(
          (a, b) =>
            b.amount -
            a.amount
        );
    }, [dailyCash]);

  const expenses =
    useMemo(() => {
      const totals =
        new Map<
          string,
          number
        >();

      dailyCash?.expenses.forEach(
        (expense) => {
          const description =
            expense.description?.trim() ||
            "Diğer";

          totals.set(
            description,
            (totals.get(
              description
            ) || 0) +
              expense.amount
          );
        }
      );

      return Array.from(
        totals.entries()
      )
        .map(
          ([
            name,
            amount,
          ]) => ({
            name,
            amount,
          })
        )
        .sort(
          (a, b) =>
            b.amount -
            a.amount
        );
    }, [dailyCash]);

  if (!user) {
    return (
      <DashboardLoading />
    );
  }

  if (
    user.role !== "ADMIN"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-4">
        <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-6 text-center shadow-sm">
          <AlertCircle
            size={32}
            className="mx-auto text-orange-500"
          />

          <h1 className="mt-4 text-lg font-bold">
            Yönetici ekranı
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Dashboard yalnızca
            yönetici hesabından
            görüntülenebilir.
          </p>
        </div>
      </main>
    );
  }

  if (
    loading &&
    !dailyCash
  ) {
    return (
      <DashboardLoading />
    );
  }

  const totalIncome =
    dailyCash?.totalIncome ||
    0;

  const totalExpense =
    dailyCash?.totalExpense ||
    0;

  const netAmount =
    dailyCash?.netAmount ||
    0;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              Günlük Operasyon Paneli
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Bugünün satış, gider ve
              kurye bilgileri
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm">
              <CalendarDays
                size={17}
              />

              {formatDate(
                getToday()
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                void loadDashboard()
              }
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              aria-label="Dashboard yenile"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                {getInitials(
                  user.fullName
                )}
              </div>

              <div>
                <p className="max-w-[160px] truncate text-sm font-semibold">
                  {user.fullName}
                </p>

                <p className="text-xs text-slate-500">
                  Yönetici
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ERROR */}

        {error && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex gap-2">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* TODAY CARDS */}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
          <SummaryCard
            title="Bugünkü Satış"
            value={formatCurrency(
              totalIncome
            )}
            type="green"
            icon={
              <ShoppingBag
                size={20}
              />
            }
          />

          <SummaryCard
            title="Bugünkü Gider"
            value={formatCurrency(
              totalExpense
            )}
            type="red"
            icon={
              <TrendingDown
                size={20}
              />
            }
          />

          <SummaryCard
            title="Bugünkü Net"
            value={formatCurrency(
              netAmount
            )}
            type={
              netAmount >= 0
                ? "blue"
                : "red"
            }
            icon={
              <CircleDollarSign
                size={20}
              />
            }
          />

          <SummaryCard
            title="Bugünkü Paket"
            value={String(
              totalPackageCount
            )}
            secondary={formatCurrency(
              totalPackageAmount
            )}
            type="orange"
            icon={
              <Package
                size={20}
              />
            }
          />
        </div>

        {/* LIVE STATUS */}

        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:mt-6">
          <StatusCard
            title="Aktif Kurye"
            value={String(
              activeCouriers.length
            )}
            icon={
              <Bike
                size={18}
              />
            }
          />

          <StatusCard
            title="Satış Kanalı"
            value={String(
              salesChannels.length
            )}
            icon={
              <WalletCards
                size={18}
              />
            }
          />

          <StatusCard
            title="Gider Kalemi"
            value={String(
              expenses.length
            )}
            icon={
              <ReceiptText
                size={18}
              />
            }
          />

          <StatusCard
            title="En Yoğun Kurye"
            value={
              topCourier
                ? topCourier.name
                : "—"
            }
            secondary={
              topCourier
                ? `${topCourier.packageCount} paket`
                : "Henüz paket yok"
            }
            icon={
              <TrendingUp
                size={18}
              />
            }
          />
        </section>

        {/* COURIER + CASH */}

        <div className="mt-4 grid grid-cols-1 gap-4 xl:mt-6 xl:grid-cols-2 xl:gap-6">
          {/* COURIER */}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader
              title="Bugünkü Kuryeler"
              icon={
                <Bike
                  size={20}
                />
              }
              href="/kurye-takip"
              linkText="Kurye Takip"
            />

            {courierList.length ===
            0 ? (
              <EmptyState text="Henüz kurye kaydı bulunmuyor." />
            ) : (
              <div className="space-y-2">
                {courierList.map(
                  (
                    courier
                  ) => (
                    <div
                      key={
                        courier.id
                      }
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          courier.active
                            ? "bg-orange-50 text-orange-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Bike
                          size={
                            18
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold">
                            {
                              courier.name
                            }
                          </p>

                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              courier.active
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />
                        </div>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {courier.active
                            ? "Aktif"
                            : "Pasif"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {
                            courier.packageCount
                          }{" "}
                          paket
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                          {formatCurrency(
                            courier.totalAmount
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <MiniCard
                title="Toplam Paket"
                value={String(
                  totalPackageCount
                )}
                className="text-orange-500"
              />

              <MiniCard
                title="Kurye Toplamı"
                value={formatCurrency(
                  totalPackageAmount
                )}
                className="text-emerald-600"
              />
            </div>
          </section>

          {/* DAILY CASH */}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader
              title="Bugünkü Kasa"
              icon={
                <WalletCards
                  size={20}
                />
              }
              href="/gunluk-kasa"
              linkText="Günlük Kasa"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Satış Kanalları
                </p>

                {salesChannels.length ===
                0 ? (
                  <EmptyState text="Bugün satış kaydı yok." />
                ) : (
                  <div className="space-y-2">
                    {salesChannels
                      .slice(
                        0,
                        6
                      )
                      .map(
                        (
                          item
                        ) => (
                          <CashRow
                            key={
                              item.name
                            }
                            label={
                              item.name
                            }
                            value={formatCurrency(
                              item.amount
                            )}
                          />
                        )
                      )}
                  </div>
                )}

                <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                  <p className="text-[11px] font-medium text-emerald-700">
                    Toplam Satış
                  </p>

                  <p className="mt-1 text-lg font-bold text-emerald-700">
                    {formatCurrency(
                      totalIncome
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Giderler
                </p>

                {expenses.length ===
                0 ? (
                  <EmptyState text="Bugün gider kaydı yok." />
                ) : (
                  <div className="space-y-2">
                    {expenses
                      .slice(
                        0,
                        6
                      )
                      .map(
                        (
                          item
                        ) => (
                          <CashRow
                            key={
                              item.name
                            }
                            label={
                              item.name
                            }
                            value={formatCurrency(
                              item.amount
                            )}
                          />
                        )
                      )}
                  </div>
                )}

                <div className="mt-3 rounded-xl bg-red-50 p-3">
                  <p className="text-[11px] font-medium text-red-600">
                    Toplam Gider
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-600">
                    {formatCurrency(
                      totalExpense
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* WEEKLY + MONTHLY */}

        <div className="mt-4 grid grid-cols-1 gap-4 xl:mt-6 xl:grid-cols-2 xl:gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader
              title="Son 7 Gün"
              icon={
                <ChartNoAxesCombined
                  size={20}
                />
              }
              href="/raporlar"
              linkText="Raporlar"
            />

            <WeeklyChart
              report={
                weeklyReport
              }
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader
              title={
                monthlySummary
                  ? formatMonth(
                      monthlySummary.month
                    )
                  : "Bu Ay"
              }
              icon={
                <CalendarDays
                  size={20}
                />
              }
              href="/ay-sonu"
              linkText="Ay Sonu"
            />

            {monthlySummary ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <MonthMetric
                    label="Aylık Satış"
                    value={formatCurrency(
                      monthlySummary.totalIncome
                    )}
                    tone="green"
                  />

                  <MonthMetric
                    label="Günlük Giderler"
                    value={formatCurrency(
                      monthlySummary.dailyExpenseTotal
                    )}
                    tone="red"
                  />

                  <MonthMetric
                    label="Ekstra Giderler"
                    value={formatCurrency(
                      monthlySummary.extraExpenseTotal
                    )}
                    tone="orange"
                  />

                  <MonthMetric
                    label="Aylık Net"
                    value={formatCurrency(
                      monthlySummary.netAmount
                    )}
                    tone={
                      monthlySummary.netAmount >=
                      0
                        ? "blue"
                        : "red"
                    }
                  />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Toplam Aylık Gider
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {formatCurrency(
                        monthlySummary.totalExpense
                      )}
                    </p>
                  </div>

                  <Clock3
                    size={24}
                    className="text-slate-300"
                  />
                </div>
              </>
            ) : (
              <EmptyState text="Aylık özet yüklenemedi." />
            )}
          </section>
        </div>

        {/* END OF DAY */}

        <section className="mt-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6 xl:mt-6">
          <div className="mb-4">
            <h2 className="font-bold">
              Gün Sonu Özeti
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Bugünün canlı
              rakamları
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
            <MiniCard
              title="Toplam Satış"
              value={formatCurrency(
                totalIncome
              )}
              className="text-emerald-600"
            />

            <MiniCard
              title="Toplam Gider"
              value={formatCurrency(
                totalExpense
              )}
              className="text-red-500"
            />

            <MiniCard
              title="Net Kalan"
              value={formatCurrency(
                netAmount
              )}
              className={
                netAmount >= 0
                  ? "text-blue-600"
                  : "text-red-500"
              }
            />

            <MiniCard
              title="Kuryeler Toplamı"
              value={formatCurrency(
                totalPackageAmount
              )}
              className="text-orange-500"
            />
          </div>
        </section>

        {/* QUICK ACCESS */}

        <section className="mt-4 xl:mt-6">
          <h2 className="mb-3 text-sm font-bold">
            Hızlı İşlemler
          </h2>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickLink
              href="/kurye-takip"
              title="Kurye Takip"
              description="Paket girişleri"
              icon={
                <Bike
                  size={20}
                />
              }
            />

            <QuickLink
              href="/gunluk-kasa"
              title="Günlük Kasa"
              description="Satış ve gider"
              icon={
                <WalletCards
                  size={20}
                />
              }
            />

            <QuickLink
              href="/ay-sonu"
              title="Ay Sonu"
              description="Aylık sonuçlar"
              icon={
                <CalendarDays
                  size={20}
                />
              }
            />

            <QuickLink
              href="/raporlar"
              title="Raporlar"
              description="Detaylı analiz"
              icon={
                <ChartNoAxesCombined
                  size={20}
                />
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
      <div className="text-center">
        <LoaderCircle
          size={34}
          className="mx-auto animate-spin text-orange-500"
        />

        <p className="mt-3 text-sm text-slate-500">
          Dashboard yükleniyor...
        </p>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  secondary,
  type,
  icon,
}: {
  title: string;
  value: string;
  secondary?: string;
  type:
    | "green"
    | "red"
    | "blue"
    | "orange";
  icon: ReactNode;
}) {
  const styles = {
    green: {
      text:
        "text-emerald-600",
      bg:
        "bg-emerald-50",
    },

    red: {
      text:
        "text-red-500",
      bg:
        "bg-red-50",
    },

    blue: {
      text:
        "text-blue-600",
      bg:
        "bg-blue-50",
    },

    orange: {
      text:
        "text-orange-500",
      bg:
        "bg-orange-50",
    },
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[type].bg} ${styles[type].text}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-500 sm:text-sm">
        {title}
      </p>

      <p
        className={`mt-1 break-words text-lg font-bold sm:mt-2 sm:text-2xl ${styles[type].text}`}
      >
        {value}
      </p>

      {secondary && (
        <p className="mt-1 text-xs font-medium text-slate-400">
          {secondary}
        </p>
      )}
    </div>
  );
}

function StatusCard({
  title,
  value,
  secondary,
  icon,
}: {
  title: string;
  value: string;
  secondary?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center gap-2 text-orange-500">
        {icon}

        <p className="text-[11px] font-medium text-slate-500">
          {title}
        </p>
      </div>

      <p className="mt-2 truncate text-base font-bold sm:text-lg">
        {value}
      </p>

      {secondary && (
        <p className="mt-0.5 text-[11px] text-slate-400">
          {secondary}
        </p>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  href,
  linkText,
}: {
  title: string;
  icon: ReactNode;
  href: string;
  linkText: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="text-orange-500">
          {icon}
        </div>

        <h2 className="truncate font-bold">
          {title}
        </h2>
      </div>

      <Link
        href={href}
        className="flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-600 transition hover:text-orange-700"
      >
        {linkText}

        <ArrowRight
          size={14}
        />
      </Link>
    </div>
  );
}

function CashRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[42px] items-center justify-between gap-3 rounded-lg bg-slate-50 px-3">
      <span className="min-w-0 truncate text-xs text-slate-600">
        {label}
      </span>

      <span className="shrink-0 text-xs font-bold">
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
      {text}
    </div>
  );
}

function MiniCard({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
      <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
        {title}
      </p>

      <p
        className={`mt-2 break-words text-base font-bold sm:text-xl ${className}`}
      >
        {value}
      </p>
    </div>
  );
}

function MonthMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone:
    | "green"
    | "red"
    | "blue"
    | "orange";
}) {
  const styles = {
    green:
      "bg-emerald-50 text-emerald-700",

    red:
      "bg-red-50 text-red-600",

    blue:
      "bg-blue-50 text-blue-600",

    orange:
      "bg-orange-50 text-orange-600",
  };

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 ${styles[tone]}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>

      <p className="mt-2 break-words text-base font-bold sm:text-lg">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
        {icon}
      </div>

      <p className="mt-3 text-sm font-bold">
        {title}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          {description}
        </p>

        <ArrowRight
          size={14}
          className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500"
        />
      </div>
    </Link>
  );
}

/* =========================================================
   WEEKLY CHART
========================================================= */

function WeeklyChart({
  report,
}: {
  report: Report | null;
}) {
  if (
    !report ||
    report.days.length ===
      0
  ) {
    return (
      <EmptyState text="Son 7 gün için veri bulunmuyor." />
    );
  }

  const maximum =
    Math.max(
      1,
      ...report.days.flatMap(
        (day) => [
          day.totalIncome,
          day.totalExpense,
        ]
      )
    );

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Satış
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Gider
        </div>
      </div>

      <div className="flex h-[190px] items-end gap-2 overflow-x-auto pb-1">
        {report.days.map(
          (day) => {
            const incomeHeight =
              day.totalIncome >
              0
                ? Math.max(
                    4,
                    (day.totalIncome /
                      maximum) *
                      125
                  )
                : 2;

            const expenseHeight =
              day.totalExpense >
              0
                ? Math.max(
                    4,
                    (day.totalExpense /
                      maximum) *
                      125
                  )
                : 2;

            return (
              <div
                key={
                  day.date
                }
                className="flex min-w-[52px] flex-1 flex-col items-center justify-end"
              >
                <div className="flex h-[130px] items-end gap-1">
                  <div
                    title={`Satış: ${formatCurrency(
                      day.totalIncome
                    )}`}
                    className="w-3 rounded-t bg-emerald-500"
                    style={{
                      height: `${incomeHeight}px`,
                    }}
                  />

                  <div
                    title={`Gider: ${formatCurrency(
                      day.totalExpense
                    )}`}
                    className="w-3 rounded-t bg-red-500"
                    style={{
                      height: `${expenseHeight}px`,
                    }}
                  />
                </div>

                <p className="mt-2 whitespace-nowrap text-[10px] font-medium text-slate-400">
                  {formatShortDate(
                    day.date
                  )}
                </p>
              </div>
            );
          }
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        <MiniStat
          label="7 Gün Satış"
          value={formatCurrency(
            report.totalIncome
          )}
          className="text-emerald-600"
        />

        <MiniStat
          label="7 Gün Gider"
          value={formatCurrency(
            report.dailyExpenseTotal
          )}
          className="text-red-500"
        />

        <MiniStat
          label="7 Gün Net"
          value={formatCurrency(
            report.totalIncome -
              report.dailyExpenseTotal
          )}
          className={
            report.totalIncome -
              report.dailyExpenseTotal >=
            0
              ? "text-blue-600"
              : "text-red-500"
          }
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-xs font-bold sm:text-sm ${className}`}
      >
        {value}
      </p>
    </div>
  );
}