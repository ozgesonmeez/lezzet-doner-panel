"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  FileText,
  LoaderCircle,
  Minus,
  Phone,
  Plus,
  ReceiptText,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  createCreditTransaction,
  getCreditCustomer,
} from "@/lib/credits-api";

import type {
  CreditCustomerDetail,
  CreditTransactionType,
} from "@/lib/credits-api";

type TransactionForm = {
  type: CreditTransactionType;
  amount: string;
  transactionDate: string;
  note: string;
};

function getTodayInIstanbul() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(
    new Date()
  );
}

function createEmptyForm(
  type: CreditTransactionType
): TransactionForm {
  return {
    type,
    amount: "",
    transactionDate:
      getTodayInIstanbul(),
    note: "",
  };
}

export default function CreditCustomerPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const customerId =
    Number(
      params.customerId
    );

  const [customer, setCustomer] =
    useState<CreditCustomerDetail | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    transactionModalOpen,
    setTransactionModalOpen,
  ] =
    useState(false);

  const [form, setForm] =
    useState<TransactionForm>(
      createEmptyForm(
        "CREDIT"
      )
    );

  const todayDate =
    getTodayInIstanbul();

  const loadCustomer =
    useCallback(async () => {
      if (
        !Number.isFinite(
          customerId
        ) ||
        customerId <= 0
      ) {
        setError(
          "Geçersiz veresiye kaydı."
        );

        setLoading(false);

        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await getCreditCustomer(
            customerId
          );

        setCustomer(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Defter yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    }, [customerId]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      return;
    }

    if (
      user.role !== "ADMIN"
    ) {
      router.replace(
        "/kurye-takip"
      );

      return;
    }

    void loadCustomer();
  }, [
    authLoading,
    user,
    router,
    loadCustomer,
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
        timeZone:
          "Europe/Istanbul",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(
        `${value}T12:00:00+03:00`
      )
    );
  }

  function openTransactionModal(
    type: CreditTransactionType
  ) {
    setError("");

    setForm(
      createEmptyForm(type)
    );

    setTransactionModalOpen(
      true
    );
  }

  function closeTransactionModal() {
    if (processing) {
      return;
    }

    setTransactionModalOpen(
      false
    );

    setForm(
      createEmptyForm(
        "CREDIT"
      )
    );

    setError("");
  }

  async function handleSaveTransaction() {
    if (!customer) {
      return;
    }

    const amount =
      Number(
        form.amount.replace(
          ",",
          "."
        )
      );

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      setError(
        "Geçerli bir tutar girin."
      );

      return;
    }

    if (
      !form.transactionDate
    ) {
      setError(
        "İşlem tarihini seçin."
      );

      return;
    }

    if (
      form.transactionDate >
      todayDate
    ) {
      setError(
        "Gelecek tarihe işlem eklenemez."
      );

      return;
    }

    if (
      form.type ===
        "PAYMENT" &&
      amount >
        Number(
          customer.balance
        )
    ) {
      setError(
        "Ödeme tutarı mevcut borçtan fazla olamaz."
      );

      return;
    }

    setProcessing(true);
    setError("");

    try {
      await createCreditTransaction(
        customer.id,
        form.type,
        amount,
        form.transactionDate,
        form.note
      );

      setTransactionModalOpen(
        false
      );

      setForm(
        createEmptyForm(
          "CREDIT"
        )
      );

      await loadCustomer();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "İşlem kaydedilemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (
    authLoading ||
    !user ||
    user.role !== "ADMIN" ||
    loading
  ) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <LoaderCircle
            size={20}
            className="animate-spin"
          />

          Defter yükleniyor...
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <Link
          href="/veresiye"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#082d4e]"
        >
          <ArrowLeft
            size={18}
          />

          Veresiye Defteri
        </Link>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
          {error ||
            "Kişi bulunamadı."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 pb-5 pt-5 sm:px-6 lg:px-8">
        <Link
          href="/veresiye"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-orange-500"
        >
          <ArrowLeft
            size={17}
          />

          Veresiye Defteri
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#082d4e] text-white">
              <UserRound
                size={21}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">
                Kişi Defteri
              </p>

              <h1 className="mt-0.5 text-2xl font-black text-[#082d4e]">
                {
                  customer.customerName
                }
              </h1>

              {customer.phone && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone
                    size={14}
                  />

                  {
                    customer.phone
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {error &&
          !transactionModalOpen && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

        <section className="rounded-3xl bg-[#082d4e] p-5 text-white shadow-xl sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
            Güncel Borç
          </p>

          <p className="mt-2 text-3xl font-black sm:text-4xl">
            {formatCurrency(
              Number(
                customer.balance
              )
            )}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                openTransactionModal(
                  "CREDIT"
                )
              }
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 text-sm font-bold text-white"
            >
              <Plus size={19} />

              Veresiye Ekle
            </button>

            <button
              type="button"
              disabled={
                Number(
                  customer.balance
                ) <= 0
              }
              onClick={() =>
                openTransactionModal(
                  "PAYMENT"
                )
              }
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-[#082d4e] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={19} />

              Ödeme Al
            </button>
          </div>
        </section>

        {customer.note && (
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <div className="flex items-start gap-2">
              <FileText
                size={17}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <p>
                {customer.note}
              </p>
            </div>
          </section>
        )}

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-lg font-black text-[#082d4e]">
              Hesap Hareketleri
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              En yeni işlem
              en üstte gösterilir.
            </p>
          </div>

          {customer.transactions.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <ReceiptText
                size={36}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-bold text-slate-700">
                Bu defter henüz boş
              </p>

              <p className="mt-1 text-xs text-slate-500">
                İlk veresiye
                hareketini ekleyin.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {customer.transactions.map(
                (
                  transaction,
                  index
                ) => {
                  const isCredit =
                    transaction.type ===
                    "CREDIT";

                  return (
                    <div
                      key={
                        transaction.id
                      }
                      className={`p-4 sm:p-5 ${
                        index !==
                        customer
                          .transactions
                          .length -
                          1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isCredit
                                ? "bg-orange-50 text-orange-500"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {isCredit ? (
                              <Plus
                                size={18}
                              />
                            ) : (
                              <Minus
                                size={18}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-black text-[#082d4e]">
                              {isCredit
                                ? "Veresiye"
                                : "Ödeme"}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <CalendarDays
                                size={13}
                              />

                              {formatDate(
                                transaction.transactionDate
                              )}
                            </p>

                            {transaction.note && (
                              <p className="mt-2 break-words text-sm text-slate-600">
                                {
                                  transaction.note
                                }
                              </p>
                            )}

                            {transaction.createdByName && (
                              <p className="mt-2 text-[10px] text-slate-400">
                                Kaydeden:{" "}
                                {
                                  transaction.createdByName
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <p
                          className={`shrink-0 text-base font-black sm:text-lg ${
                            isCredit
                              ? "text-orange-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {isCredit
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            Number(
                              transaction.amount
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      {transactionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                  {
                    customer.customerName
                  }
                </p>

                <h2 className="mt-1 text-xl font-black text-[#082d4e]">
                  {form.type ===
                  "CREDIT"
                    ? "Veresiye Ekle"
                    : "Ödeme Al"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeTransactionModal
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <FormField
                label={
                  form.type ===
                  "CREDIT"
                    ? "Veresiye Tutarı"
                    : "Alınan Ödeme"
                }
              >
                <div className="flex items-center gap-2">
                  <CircleDollarSign
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    autoFocus
                    inputMode="decimal"
                    value={
                      form.amount
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          amount:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="0,00"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />

                  <span className="text-sm font-bold text-slate-400">
                    TL
                  </span>
                </div>
              </FormField>

              <FormField label="Tarih">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    type="date"
                    value={
                      form.transactionDate
                    }
                    max={
                      todayDate
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          transactionDate:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </FormField>

              <FormField
                label="Not"
                optional
              >
                <textarea
                  value={
                    form.note
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        note:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder={
                    form.type ===
                    "CREDIT"
                      ? "Örn. 2 et dürüm"
                      : "İsteğe bağlı ödeme notu"
                  }
                  maxLength={500}
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm outline-none"
                />
              </FormField>
            </div>

            {form.type ===
              "PAYMENT" && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-xs font-semibold text-slate-500">
                  Mevcut Borç
                </span>

                <span className="text-sm font-black text-[#082d4e]">
                  {formatCurrency(
                    Number(
                      customer.balance
                    )
                  )}
                </span>
              </div>
            )}

            <button
              type="button"
              disabled={
                processing
              }
              onClick={() =>
                void handleSaveTransaction()
              }
              className={`mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${
                form.type ===
                "CREDIT"
                  ? "bg-orange-500"
                  : "bg-emerald-600"
              }`}
            >
              {processing ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : form.type ===
                "CREDIT" ? (
                <Plus size={19} />
              ) : (
                <WalletCards
                  size={19}
                />
              )}

              {form.type ===
              "CREDIT"
                ? "Veresiyeyi Kaydet"
                : "Ödemeyi Kaydet"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function FormField({
  label,
  optional = false,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-bold text-slate-600">
          {label}
        </span>

        {optional && (
          <span className="text-[10px] text-slate-400">
            İsteğe bağlı
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 px-4 py-3 focus-within:border-orange-400">
        {children}
      </div>
    </label>
  );
}