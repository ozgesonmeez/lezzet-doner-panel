"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  ChevronDown,
  Edit3,
  LoaderCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import {
  createMonthlyExtraExpense,
  deleteMonthlyExtraExpense,
  getMonthlySummary,
  updateMonthlyExtraExpense,
} from "@/lib/api";

import type {
  MonthlyExtraExpense,
  MonthlySummary,
} from "@/lib/api";

type ExpenseForm = {
  id: number | null;
  description: string;
  amount: string;
};

function getCurrentMonth() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
}

export default function MonthlySummaryPage() {
  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth());

  const [summary, setSummary] =
    useState<MonthlySummary | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    expenseModalOpen,
    setExpenseModalOpen,
  ] = useState(false);

  const [
    showAllDays,
    setShowAllDays,
  ] = useState(false);

  const [expenseForm, setExpenseForm] =
    useState<ExpenseForm>({
      id: null,
      description: "",
      amount: "",
    });

  const loadSummary = useCallback(
    async (
      month: string,
      showLoader = true
    ) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const data =
          await getMonthlySummary(
            month
          );

        setSummary(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ay sonu bilgileri yüklenemedi."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadSummary(
      selectedMonth
    );
  }, [
    selectedMonth,
    loadSummary,
  ]);

  const visibleDays = useMemo(() => {
    if (!summary) {
      return [];
    }

    if (showAllDays) {
      return summary.days;
    }

    return summary.days.filter(
      (day) =>
        Number(day.totalIncome) !==
          0 ||
        Number(day.totalExpense) !==
          0
    );
  }, [summary, showAllDays]);

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

  function formatMonth(
    value: string
  ) {
    const [year, month] =
      value.split("-");

    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(
        Number(year),
        Number(month) - 1,
        1
      )
    );
  }

  function formatDay(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        day: "2-digit",
        month: "short",
        weekday: "short",
      }
    ).format(
      new Date(
        `${value}T12:00:00`
      )
    );
  }

  function parseAmount(
    value: string
  ) {
    let normalized = value
      .trim()
      .replace(/\s/g, "")
      .replace(/[₺TLtl]/g, "");

    if (
      normalized.includes(".") &&
      normalized.includes(",")
    ) {
      normalized = normalized
        .replace(/\./g, "")
        .replace(",", ".");
    } else if (
      normalized.includes(",")
    ) {
      normalized =
        normalized.replace(",", ".");
    }

    normalized =
      normalized.replace(
        /[^\d.]/g,
        ""
      );

    const number =
      Number(normalized);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  function resetExpenseForm() {
    setExpenseForm({
      id: null,
      description: "",
      amount: "",
    });
  }

  function openNewExpense() {
    resetExpenseForm();
    setExpenseModalOpen(true);
  }

  function openEditExpense(
    expense: MonthlyExtraExpense
  ) {
    setExpenseForm({
      id: expense.id,
      description:
        expense.description,
      amount: String(
        expense.amount
      ).replace(".", ","),
    });

    setExpenseModalOpen(true);
  }

  async function saveExpense() {
    const description =
      expenseForm.description.trim();

    const amount =
      parseAmount(
        expenseForm.amount
      );

    if (
      !description ||
      amount <= 0 ||
      processing
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      if (expenseForm.id) {
        await updateMonthlyExtraExpense(
          expenseForm.id,
          description,
          amount
        );
      } else {
        await createMonthlyExtraExpense(
          selectedMonth,
          description,
          amount
        );
      }

      setExpenseModalOpen(false);

      resetExpenseForm();

      await loadSummary(
        selectedMonth,
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ay sonu gideri kaydedilemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function removeExpense(
    expenseId: number
  ) {
    const confirmed =
      window.confirm(
        "Bu ay sonu giderini silmek istediğine emin misin?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      await deleteMonthlyExtraExpense(
        expenseId
      );

      await loadSummary(
        selectedMonth,
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ay sonu gideri silinemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="text-center">
          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-orange-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Ay sonu hazırlanıyor...
          </p>
        </div>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-4">
        <p>
          Ay sonu bilgileri
          alınamadı.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays
                size={24}
                className="text-orange-500"
              />

              <h1 className="text-xl font-bold sm:text-2xl">
                Ay Sonu
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Aylık gelir, gider ve
              net sonucu takip edin
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(
                  event.target.value
                )
              }
              className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none sm:flex-none"
            />

            <button
              type="button"
              onClick={() =>
                void loadSummary(
                  selectedMonth
                )
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white"
            >
              <RefreshCw size={19} />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-5">
          <p className="text-sm font-medium text-slate-500">
            Seçili dönem
          </p>

          <h2 className="mt-1 text-xl font-bold capitalize">
            {formatMonth(
              selectedMonth
            )}
          </h2>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <SummaryCard
            title="Toplam Gelir"
            value={formatCurrency(
              Number(
                summary.totalIncome
              )
            )}
            type="green"
            icon={
              <TrendingUp
                size={19}
              />
            }
          />

          <SummaryCard
            title="Günlük Giderler"
            value={formatCurrency(
              Number(
                summary.dailyExpenseTotal
              )
            )}
            type="red"
            icon={
              <TrendingDown
                size={19}
              />
            }
          />

          <SummaryCard
            title="Ay Sonu Giderleri"
            value={formatCurrency(
              Number(
                summary.extraExpenseTotal
              )
            )}
            type="orange"
            icon={
              <ReceiptText
                size={19}
              />
            }
          />

          <SummaryCard
            title="Toplam Gider"
            value={formatCurrency(
              Number(
                summary.totalExpense
              )
            )}
            type="red"
            icon={
              <TrendingDown
                size={19}
              />
            }
          />

          <div className="col-span-2 xl:col-span-1">
            <SummaryCard
              title="Net Kalan"
              value={formatCurrency(
                Number(
                  summary.netAmount
                )
              )}
              type={
                Number(
                  summary.netAmount
                ) >= 0
                  ? "blue"
                  : "red"
              }
              icon={
                <Wallet size={19} />
              }
            />
          </div>
        </div>

        {/* MONTHLY EXPENSES */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
            <div>
              <h2 className="font-bold">
                Ay Sonu Ek Giderleri
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Günlük kasaya
                yazılmayan aylık
                giderler
              </p>
            </div>

            <button
              type="button"
              onClick={openNewExpense}
              className="flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 text-xs font-bold text-white"
            >
              <Plus size={17} />
              Gider Ekle
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {summary.extraExpenses
              .length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                <ReceiptText
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-2 text-sm text-slate-400">
                  Bu ay için ek gider
                  yok.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {summary.extraExpenses.map(
                  (expense) => (
                    <div
                      key={expense.id}
                      className="flex min-h-[64px] items-center gap-3 rounded-xl border border-slate-100 px-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <ReceiptText
                          size={18}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {
                            expense.description
                          }
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-red-500 sm:text-base">
                        {formatCurrency(
                          Number(
                            expense.amount
                          )
                        )}
                      </p>

                      <div className="flex shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            openEditExpense(
                              expense
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit3
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void removeExpense(
                              expense.id
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="mt-4 rounded-xl bg-orange-50 p-4">
              <p className="text-xs font-semibold text-orange-700">
                Ay Sonu Ek Gider
                Toplamı
              </p>

              <p className="mt-1 text-xl font-bold text-orange-600">
                {formatCurrency(
                  Number(
                    summary.extraExpenseTotal
                  )
                )}
              </p>
            </div>
          </div>
        </section>

        {/* DAILY BREAKDOWN */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() =>
              setShowAllDays(
                (value) => !value
              )
            }
            className="flex min-h-[68px] w-full items-center justify-between gap-3 border-b border-slate-100 px-4 text-left sm:px-5"
          >
            <div>
              <h2 className="font-bold">
                Günlük Döküm
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {showAllDays
                  ? "Ayın tüm günleri gösteriliyor"
                  : "Yalnızca işlem yapılan günler gösteriliyor"}
              </p>
            </div>

            <ChevronDown
              size={20}
              className={`transition ${
                showAllDays
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          <div className="p-4 sm:p-5">
            {visibleDays.length ===
            0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                Bu ay henüz günlük
                işlem yok.
              </div>
            ) : (
              <div className="space-y-2">
                {visibleDays.map(
                  (day) => (
                    <div
                      key={day.date}
                      className="rounded-xl border border-slate-100 p-3 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4"
                    >
                      <p className="mb-3 text-sm font-bold capitalize sm:mb-0">
                        {formatDay(
                          day.date
                        )}
                      </p>

                      <DayValue
                        title="Gelir"
                        value={formatCurrency(
                          Number(
                            day.totalIncome
                          )
                        )}
                        className="text-emerald-600"
                      />

                      <DayValue
                        title="Gider"
                        value={formatCurrency(
                          Number(
                            day.totalExpense
                          )
                        )}
                        className="text-red-500"
                      />

                      <DayValue
                        title="Net"
                        value={formatCurrency(
                          Number(
                            day.netAmount
                          )
                        )}
                        className={
                          Number(
                            day.netAmount
                          ) >= 0
                            ? "text-blue-600"
                            : "text-red-500"
                        }
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {!showAllDays && (
              <button
                type="button"
                onClick={() =>
                  setShowAllDays(true)
                }
                className="mt-4 w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600"
              >
                Ayın Tüm Günlerini
                Göster
              </button>
            )}
          </div>
        </section>

        {/* FINAL */}
        <section className="mt-5 rounded-2xl bg-[#082d4e] p-5 text-white shadow-sm sm:p-6">
          <p className="text-xs font-medium text-slate-300">
            {formatMonth(
              selectedMonth
            )} Net Sonucu
          </p>

          <p
            className={`mt-2 text-3xl font-black sm:text-4xl ${
              Number(
                summary.netAmount
              ) >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {formatCurrency(
              Number(
                summary.netAmount
              )
            )}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[11px] text-slate-300">
                Gelir
              </p>

              <p className="mt-1 font-bold">
                {formatCurrency(
                  Number(
                    summary.totalIncome
                  )
                )}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[11px] text-slate-300">
                Toplam Gider
              </p>

              <p className="mt-1 font-bold">
                {formatCurrency(
                  Number(
                    summary.totalExpense
                  )
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {expenseForm.id
                    ? "Ay Sonu Giderini Düzenle"
                    : "Ay Sonu Gideri Ekle"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Günlük kasa dışında
                  kalan gideri girin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setExpenseModalOpen(
                    false
                  );
                  resetExpenseForm();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Gider Açıklaması
              </label>

              <input
                autoFocus
                value={
                  expenseForm.description
                }
                onChange={(event) =>
                  setExpenseForm(
                    (current) => ({
                      ...current,
                      description:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Örn. Kira"
                className="min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-400"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Tutar
              </label>

              <div className="relative">
                <input
                  value={
                    expenseForm.amount
                  }
                  onChange={(event) =>
                    setExpenseForm(
                      (current) => ({
                        ...current,
                        amount:
                          event.target
                            .value,
                      })
                    )
                  }
                  inputMode="decimal"
                  placeholder="0,00"
                  className="min-h-[54px] w-full rounded-xl border border-slate-200 px-4 pr-12 text-lg font-semibold outline-none focus:border-orange-400"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                  ₺
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={
                processing ||
                !expenseForm.description.trim() ||
                parseAmount(
                  expenseForm.amount
                ) <= 0
              }
              onClick={() =>
                void saveExpense()
              }
              className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white disabled:opacity-50"
            >
              {processing ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Check size={19} />
              )}

              Kaydet
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  type,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  type:
    | "green"
    | "red"
    | "orange"
    | "blue";
}) {
  const styles = {
    green:
      "bg-emerald-50 text-emerald-600",
    red:
      "bg-red-50 text-red-500",
    orange:
      "bg-orange-50 text-orange-500",
    blue:
      "bg-blue-50 text-blue-600",
  };

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[type]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-500 sm:text-xs">
        {title}
      </p>

      <p
        className={`mt-1 break-words text-lg font-bold sm:text-xl ${
          styles[type].split(" ")[1]
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DayValue({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
  className: string;
}) {
  return (
    <div className="mb-2 flex items-center justify-between sm:mb-0 sm:block">
      <p className="text-[11px] text-slate-400">
        {title}
      </p>

      <p
        className={`text-sm font-bold ${className}`}
      >
        {value}
      </p>
    </div>
  );
}