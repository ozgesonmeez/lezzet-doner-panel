"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  LoaderCircle,
  Phone,
  Plus,
  Search,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  createCreditCustomer,
  getCreditCustomers,
} from "@/lib/credits-api";

import type {
  CreditCustomerList,
} from "@/lib/credits-api";

type CustomerForm = {
  customerName: string;
  phone: string;
  note: string;
};

const emptyForm: CustomerForm = {
  customerName: "",
  phone: "",
  note: "",
};

export default function CreditCustomersPage() {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [data, setData] =
    useState<CreditCustomerList | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    showNewCustomer,
    setShowNewCustomer,
  ] =
    useState(false);

  const [form, setForm] =
    useState<CustomerForm>(
      emptyForm
    );

  const loadCustomers =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getCreditCustomers();

        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Veresiye defteri yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    }, []);

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

    void loadCustomers();
  }, [
    authLoading,
    user,
    router,
    loadCustomers,
  ]);

  const customers =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const query =
        search
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      const filtered =
        data.customers.filter(
          (customer) => {
            if (!query) {
              return true;
            }

            const haystack = [
              customer.customerName,
              customer.phone || "",
              customer.note || "",
            ]
              .join(" ")
              .toLocaleLowerCase(
                "tr-TR"
              );

            return haystack.includes(
              query
            );
          }
        );

      return filtered.sort(
        (first, second) => {
          if (
            first.balance > 0 &&
            second.balance <= 0
          ) {
            return -1;
          }

          if (
            first.balance <= 0 &&
            second.balance > 0
          ) {
            return 1;
          }

          if (
            first.lastTransactionDate &&
            second.lastTransactionDate
          ) {
            return second.lastTransactionDate.localeCompare(
              first.lastTransactionDate
            );
          }

          return first.customerName.localeCompare(
            second.customerName,
            "tr"
          );
        }
      );
    }, [
      data,
      search,
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
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(
        `${value}T12:00:00+03:00`
      )
    );
  }

  function closeModal() {
    if (processing) {
      return;
    }

    setShowNewCustomer(
      false
    );

    setForm(
      emptyForm
    );

    setError("");
  }

  async function handleCreateCustomer() {
    const name =
      form.customerName.trim();

    if (!name) {
      setError(
        "Kişi veya işletme adını girin."
      );

      return;
    }

    setProcessing(true);
    setError("");

    try {
      const customer =
        await createCreditCustomer(
          name,
          form.phone,
          form.note
        );

      setShowNewCustomer(
        false
      );

      setForm(
        emptyForm
      );

      router.push(
        `/veresiye/${customer.id}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kişi eklenemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (
    authLoading ||
    !user ||
    user.role !== "ADMIN"
  ) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 pb-5 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
              Dijital Defter
            </p>

            <h1 className="mt-1 text-2xl font-black text-[#082d4e] sm:text-3xl">
              Veresiye Defteri
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Kişiyi bul, defterini
              aç ve bütün işlemlerini
              tek yerde görüntüle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowNewCustomer(
                true
              );
            }}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 sm:w-auto"
          >
            <Plus size={19} />

            Yeni Kişi
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {error &&
          !showNewCustomer && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={
              <CircleDollarSign
                size={20}
              />
            }
            title="Toplam Açık Veresiye"
            value={formatCurrency(
              Number(
                data?.totalOpenAmount ||
                  0
              )
            )}
            tone="orange"
          />

          <SummaryCard
            icon={
              <WalletCards
                size={20}
              />
            }
            title="Borcu Olan"
            value={`${
              data?.debtorCount || 0
            } kişi`}
            tone="blue"
          />

          <SummaryCard
            icon={
              <Users
                size={20}
              />
            }
            title="Defter Sayısı"
            value={`${
              data?.customerCount ||
              0
            } kişi`}
            tone="slate"
          />
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex min-h-[50px] items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-orange-400">
            <Search
              size={19}
              className="shrink-0 text-slate-400"
            />

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="İsim veya telefon ara..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-base font-black text-[#082d4e]">
                Kişiler
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {customers.length}{" "}
                defter gösteriliyor
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <LoaderCircle
                size={22}
                className="animate-spin text-orange-500"
              />
            </div>
          ) : customers.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <BookOpen
                size={38}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-bold text-slate-700">
                {search
                  ? "Aradığınız kişi bulunamadı"
                  : "Henüz veresiye defteri yok"}
              </p>

              {!search && (
                <p className="mt-1 text-xs text-slate-500">
                  İlk kişiyi ekleyerek
                  başlayabilirsiniz.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {customers.map(
                (customer) => (
                  <Link
                    key={
                      customer.id
                    }
                    href={`/veresiye/${customer.id}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#082d4e] text-white">
                        <UserRound
                          size={21}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-black text-[#082d4e]">
                              {
                                customer.customerName
                              }
                            </h3>

                            {customer.phone && (
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone
                                  size={13}
                                />

                                {
                                  customer.phone
                                }
                              </p>
                            )}
                          </div>

                          <ChevronRight
                            size={20}
                            className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500"
                          />
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Güncel Borç
                            </p>

                            <p
                              className={`mt-1 text-lg font-black ${
                                customer.balance >
                                0
                                  ? "text-orange-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {customer.balance >
                              0
                                ? formatCurrency(
                                    customer.balance
                                  )
                                : "Borç Yok"}
                            </p>
                          </div>

                          <div className="text-right">
                            {customer.lastTransactionDate ? (
                              <>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Son İşlem
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-600">
                                  {formatDate(
                                    customer.lastTransactionDate
                                  )}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-slate-400">
                                Henüz işlem yok
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {showNewCustomer && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-[#082d4e]">
                  Yeni Defter
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Kişi veya işletmeyi
                  bir kez oluşturmanız
                  yeterli.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
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
              <FormField label="Kişi / İşletme Adı">
                <input
                  autoFocus
                  value={
                    form.customerName
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        customerName:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Örn. Mehmet Yılmaz"
                  maxLength={160}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </FormField>

              <FormField
                label="Telefon"
                optional
              >
                <input
                  value={
                    form.phone
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        phone:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="05xx xxx xx xx"
                  maxLength={30}
                  className="w-full bg-transparent text-sm outline-none"
                />
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
                  placeholder="İsteğe bağlı açıklama..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none bg-transparent text-sm outline-none"
                />
              </FormField>
            </div>

            <button
              type="button"
              disabled={
                processing
              }
              onClick={() =>
                void handleCreateCustomer()
              }
              className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white disabled:opacity-50"
            >
              {processing ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Plus size={19} />
              )}

              Defteri Oluştur
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
        <LoaderCircle
          size={20}
          className="animate-spin"
        />

        Veresiye defteri yükleniyor...
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone:
    | "orange"
    | "blue"
    | "slate";
}) {
  const styles = {
    orange:
      "bg-orange-50 text-orange-500",
    blue:
      "bg-blue-50 text-blue-600",
    slate:
      "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 break-words text-xl font-black text-[#082d4e]">
        {value}
      </p>
    </div>
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