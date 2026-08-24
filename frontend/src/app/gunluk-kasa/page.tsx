"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Banknote,
  CalendarDays,
  Check,
  CircleDollarSign,
  CreditCard,
  Edit3,
  LoaderCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
  X,
} from "lucide-react";

import {
  createDailyExpense,
  createDailyIncome,
  deleteDailyExpense,
  deleteDailyIncome,
  getDailyCash,
  updateDailyExpense,
  updateDailyIncome,
} from "@/lib/api";

import type {
  DailyCash,
  DailyExpense,
  DailyIncome,
} from "@/lib/api";

type IncomeForm = {
  id: number | null;
  channel: string;
  amount: string;
};

type ExpenseForm = {
  id: number | null;
  description: string;
  amount: string;
};

const suggestedChannels = [
  "Nakit",
  "Kredi Kartı",
  "Yemeksepeti",
  "Trendyol",
  "Migros Yemek",
  "Getir",
];

function getTodayInIstanbul() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(
      new Date()
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

export default function DailyCashPage() {
  const [cash, setCash] =
    useState<DailyCash | null>(null);

  const [selectedDate, setSelectedDate] =
    useState(
      getTodayInIstanbul
    );

  const todayDate =
    getTodayInIstanbul();

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [incomeModalOpen, setIncomeModalOpen] =
    useState(false);

  const [
    expenseModalOpen,
    setExpenseModalOpen,
  ] = useState(false);

  const [incomeForm, setIncomeForm] =
    useState<IncomeForm>({
      id: null,
      channel: "",
      amount: "",
    });

  const [expenseForm, setExpenseForm] =
    useState<ExpenseForm>({
      id: null,
      description: "",
      amount: "",
    });

  const loadCash = useCallback(
    async (
      date: string,
      withLoader = true
    ) => {
      try {
        if (withLoader) {
          setLoading(true);
        }

        setError(null);

        const data =
          await getDailyCash(
            date
          );

        setCash(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Günlük kasa bilgileri yüklenemedi."
        );
      } finally {
        if (withLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadCash(
      selectedDate
    );
  }, [
    loadCash,
    selectedDate,
  ]);

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
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(`${value}T12:00:00`)
    );
  }

  function formatTime(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
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

  function resetIncomeForm() {
    setIncomeForm({
      id: null,
      channel: "",
      amount: "",
    });
  }

  function resetExpenseForm() {
    setExpenseForm({
      id: null,
      description: "",
      amount: "",
    });
  }

  function openNewIncome() {
    resetIncomeForm();
    setIncomeModalOpen(true);
  }

  function openEditIncome(
    income: DailyIncome
  ) {
    setIncomeForm({
      id: income.id,
      channel: income.channel,
      amount: String(
        income.amount
      ).replace(".", ","),
    });

    setIncomeModalOpen(true);
  }

  function openNewExpense() {
    resetExpenseForm();
    setExpenseModalOpen(true);
  }

  function openEditExpense(
    expense: DailyExpense
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

  async function saveIncome() {
    const channel =
      incomeForm.channel.trim();

    const amount =
      parseAmount(
        incomeForm.amount
      );

    if (
      !channel ||
      amount <= 0 ||
      processing
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      if (incomeForm.id) {
        await updateDailyIncome(
          incomeForm.id,
          channel,
          amount
        );
      } else {
        await createDailyIncome(
          channel,
          amount,
          selectedDate
        );
      }

      setIncomeModalOpen(false);
      resetIncomeForm();

      await loadCash(
        selectedDate,
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gelir kaydı kaydedilemedi."
      );
    } finally {
      setProcessing(false);
    }
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
        await updateDailyExpense(
          expenseForm.id,
          description,
          amount
        );
      } else {
        await createDailyExpense(
          description,
          amount,
          selectedDate
        );
      }

      setExpenseModalOpen(false);
      resetExpenseForm();

      await loadCash(
        selectedDate,
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gider kaydı kaydedilemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function removeIncome(
    incomeId: number
  ) {
    const confirmed =
      window.confirm(
        "Bu gelir kaydını silmek istediğine emin misin?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      await deleteDailyIncome(
        incomeId
      );

      await loadCash(
        selectedDate,
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gelir kaydı silinemedi."
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
        "Bu gider kaydını silmek istediğine emin misin?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      await deleteDailyExpense(
        expenseId
      );

      await loadCash(
        selectedDate,
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gider kaydı silinemedi."
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
            Günlük kasa yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (!cash) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-4">
        <div className="text-center">
          <p className="font-semibold">
            Kasa bilgileri alınamadı.
          </p>

          <button
            type="button"
            onClick={() =>
              void loadCash(
                selectedDate
              )
            }
            className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
          >
            Tekrar Dene
          </button>
        </div>
      </main>
    );
  }

  const totalWork =
    Number(cash.totalIncome) +
    Number(cash.totalExpense);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <WalletCards
                size={24}
                className="text-orange-500"
              />

              <h1 className="text-xl font-bold sm:text-2xl">
                Günlük Kasa
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Günlük gelir ve gider
              kayıtlarını yönetin
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm sm:flex-none">
              <CalendarDays
                size={17}
                className="shrink-0 text-slate-500"
              />

              <input
                type="date"
                value={
                  selectedDate
                }
                max={todayDate}
                onChange={(event) => {
                  const value =
                    event.target
                      .value;

                  if (
                    value &&
                    value <= todayDate
                  ) {
                    setSelectedDate(
                      value
                    );
                  }
                }}
                className="min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none"
                aria-label="Kasa tarihi"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                void loadCash(
                selectedDate
              )
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
              aria-label="Yenile"
            >
              <RefreshCw size={19} />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ERROR */}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>

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

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryCard
            title="Toplam Gelir"
            value={formatCurrency(
              Number(
                cash.totalIncome
              )
            )}
            icon={
              <TrendingUp
                size={20}
              />
            }
            type="green"
          />

          <SummaryCard
            title="Toplam Gider"
            value={formatCurrency(
              Number(
                cash.totalExpense
              )
            )}
            icon={
              <TrendingDown
                size={20}
              />
            }
            type="red"
          />

          <div className="col-span-2 sm:col-span-1">
            <SummaryCard
              title="Toplam İş"
              value={formatCurrency(
                totalWork
              )}
              icon={
                <Wallet size={20} />
              }
              type="blue"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* INCOME */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingBag
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="font-bold">
                    Gelirler
                  </h2>

                  <p className="text-xs text-slate-500">
                    Satış kanalları
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openNewIncome}
                className="flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white"
              >
                <Plus size={17} />
                Gelir Ekle
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {cash.incomes.length ===
              0 ? (
                <EmptyState
                  icon={
                    <CircleDollarSign
                      size={26}
                    />
                  }
                  text="Henüz gelir kaydı yok."
                />
              ) : (
                <div className="space-y-2">
                  {cash.incomes.map(
                    (income) => (
                      <div
                        key={income.id}
                        className="flex min-h-[66px] items-center gap-3 rounded-xl border border-slate-100 px-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          {income.channel
                            .toLocaleLowerCase(
                              "tr-TR"
                            )
                            .includes(
                              "kart"
                            ) ? (
                            <CreditCard
                              size={18}
                            />
                          ) : income.channel
                              .toLocaleLowerCase(
                                "tr-TR"
                              )
                              .includes(
                                "nakit"
                              ) ? (
                            <Banknote
                              size={18}
                            />
                          ) : (
                            <ShoppingBag
                              size={18}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {
                              income.channel
                            }
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatTime(
                              income.createdAt
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-emerald-600 sm:text-base">
                          {formatCurrency(
                            Number(
                              income.amount
                            )
                          )}
                        </p>

                        <div className="flex shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              openEditIncome(
                                income
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
                              void removeIncome(
                                income.id
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

              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">
                  Toplam Gelir
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-700">
                  {formatCurrency(
                    Number(
                      cash.totalIncome
                    )
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* EXPENSE */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <ReceiptText
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="font-bold">
                    Giderler
                  </h2>

                  <p className="text-xs text-slate-500">
                    Günlük ödemeler
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openNewExpense}
                className="flex min-h-[42px] items-center gap-2 rounded-xl bg-red-500 px-4 text-xs font-bold text-white"
              >
                <Plus size={17} />
                Gider Ekle
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {cash.expenses.length ===
              0 ? (
                <EmptyState
                  icon={
                    <ReceiptText
                      size={26}
                    />
                  }
                  text="Henüz gider kaydı yok."
                />
              ) : (
                <div className="space-y-2">
                  {cash.expenses.map(
                    (expense) => (
                      <div
                        key={expense.id}
                        className="flex min-h-[66px] items-center gap-3 rounded-xl border border-slate-100 px-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
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

                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatTime(
                              expense.createdAt
                            )}
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

              <div className="mt-4 rounded-xl bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-600">
                  Toplam Gider
                </p>

                <p className="mt-1 text-xl font-bold text-red-600">
                  {formatCurrency(
                    Number(
                      cash.totalExpense
                    )
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* DAY RESULT */}
        <section className="mt-5 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <WalletCards
                size={21}
              />
            </div>

            <div>
              <h2 className="font-bold">
                Seçili Gün
              </h2>

              <p className="text-xs text-slate-500">
                Gelir + gider toplamı
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#082d4e] p-5 text-white">
            <p className="text-xs text-slate-300">
              Seçili Gün Toplam İş
            </p>

            <p className="mt-2 text-3xl font-black text-orange-300">
              {formatCurrency(
                totalWork
              )}
            </p>
          </div>
        </section>
      </div>

      {/* INCOME MODAL */}
      {incomeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <ModalHeader
              title={
                incomeForm.id
                  ? "Geliri Düzenle"
                  : "Gelir Ekle"
              }
              subtitle={`${formatDate(selectedDate)} için satış kanalını ve tutarı girin.`}
              onClose={() => {
                setIncomeModalOpen(
                  false
                );
                resetIncomeForm();
              }}
            />

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Satış Kanalı
              </label>

              <input
                value={
                  incomeForm.channel
                }
                onChange={(event) =>
                  setIncomeForm(
                    (current) => ({
                      ...current,
                      channel:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Örn. Nakit"
                className="min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-400"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedChannels.map(
                  (channel) => (
                    <button
                      type="button"
                      key={channel}
                      onClick={() =>
                        setIncomeForm(
                          (current) => ({
                            ...current,
                            channel,
                          })
                        )
                      }
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      {channel}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Tutar
              </label>

              <MoneyInput
                value={
                  incomeForm.amount
                }
                onChange={(value) =>
                  setIncomeForm(
                    (current) => ({
                      ...current,
                      amount: value,
                    })
                  )
                }
              />
            </div>

            <button
              type="button"
              disabled={
                processing ||
                !incomeForm.channel.trim() ||
                parseAmount(
                  incomeForm.amount
                ) <= 0
              }
              onClick={() =>
                void saveIncome()
              }
              className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white disabled:opacity-50"
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

      {/* EXPENSE MODAL */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <ModalHeader
              title={
                expenseForm.id
                  ? "Gideri Düzenle"
                  : "Gider Ekle"
              }
              subtitle={`${formatDate(selectedDate)} için gider açıklamasını ve tutarı girin.`}
              onClose={() => {
                setExpenseModalOpen(
                  false
                );
                resetExpenseForm();
              }}
            />

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Gider Açıklaması
              </label>

              <input
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
                placeholder="Örn. Lavaş"
                className="min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-red-400"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Tutar
              </label>

              <MoneyInput
                value={
                  expenseForm.amount
                }
                onChange={(value) =>
                  setExpenseForm(
                    (current) => ({
                      ...current,
                      amount: value,
                    })
                  )
                }
              />
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
              className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-bold text-white disabled:opacity-50"
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
    | "blue";
}) {
  const styles = {
    green: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-emerald-600",
    },
    red: {
      icon:
        "bg-red-50 text-red-500",
      value:
        "text-red-500",
    },
    blue: {
      icon:
        "bg-blue-50 text-blue-600",
      value:
        "text-blue-600",
    },
  };

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[type].icon}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        {title}
      </p>

      <p
        className={`mt-1 break-words text-lg font-bold sm:text-xl ${styles[type].value}`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-slate-400">
      <div className="mx-auto flex justify-center">
        {icon}
      </div>

      <p className="mt-2 text-sm">
        {text}
      </p>
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
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
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
      >
        <X size={19} />
      </button>
    </div>
  );
}