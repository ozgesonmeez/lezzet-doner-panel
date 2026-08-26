"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Bike,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Globe2,
  LoaderCircle,
  Package,
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  createCourier,
  createCourierEntry,
  deleteCourier,
  deleteCourierEntry,
  getCouriersForDate,
  getTodayCouriers,
  updateCourierEntry,
  updateCourierStatus,
  type Courier,
  type CourierEntryType,
} from "@/lib/courier-api";

import {
  useAuth,
} from "@/context/AuthContext";

type EditingEntry = {
  entryId: number;
  value: string;
} | null;

function getIstanbulToday() {
  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone:
          "Europe/Istanbul",
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

function formatDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

export default function CourierTrackingPage() {
  const { user } =
    useAuth();

  const isAdmin =
    user?.role === "ADMIN";

  const today =
    getIstanbulToday();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    () =>
      getIstanbulToday()
  );

  const [
    couriers,
    setCouriers,
  ] = useState<Courier[]>(
    []
  );

  const [
    amountInputs,
    setAmountInputs,
  ] = useState<
    Record<number, string>
  >({});

  const [
    newCourierName,
    setNewCourierName,
  ] = useState("");

  const [
    showAddCourier,
    setShowAddCourier,
  ] = useState(false);

  const [
    showManagement,
    setShowManagement,
  ] = useState(false);

  const [
    expandedCouriers,
    setExpandedCouriers,
  ] = useState<
    Record<number, boolean>
  >({});

  const [
    editingEntry,
    setEditingEntry,
  ] =
    useState<EditingEntry>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const isToday =
    selectedDate === today;

  const loadCouriers =
    useCallback(
      async (
        showLoader = true
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          setError(null);

          const data =
            isAdmin
              ? await getCouriersForDate(
                  selectedDate
                )
              : await getTodayCouriers();

          setCouriers(
            data
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Kurye bilgileri yüklenemedi."
          );
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [
        isAdmin,
        selectedDate,
      ]
    );

  useEffect(() => {
    void loadCouriers();
  }, [loadCouriers]);

  const activeCouriers =
    useMemo(
      () =>
        couriers.filter(
          (courier) =>
            courier.active
        ),
      [couriers]
    );

  const visibleCouriers =
    useMemo(
      () =>
        couriers.filter(
          (courier) =>
            courier.active ||
            courier.entries
              .length > 0
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

  const totalOnlineCount =
    useMemo(
      () =>
        couriers.reduce(
          (
            total,
            courier
          ) =>
            total +
            courier.entries.filter(
              (entry) =>
                entry.entryType ===
                "ONLINE"
            ).length,
          0
        ),
      [couriers]
    );

  function formatCurrency(
    value: number
  ) {
    return new Intl.NumberFormat(
      "tr-TR",
      {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits:
          2,
      }
    ).format(value);
  }

  function formatTime(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        timeZone:
          "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(value)
    );
  }

  function formatRole(
    role:
      | "ADMIN"
      | "PAKETCI"
      | null
  ) {
    if (
      role === "ADMIN"
    ) {
      return "Yönetici";
    }

    if (
      role === "PAKETCI"
    ) {
      return "Paket Personeli";
    }

    return null;
  }

  function parseAmount(
    value: string
  ) {
    let normalized =
      value
        .trim()
        .replace(
          /\s/g,
          ""
        )
        .replace(
          /[₺TLtl]/g,
          ""
        );

    if (
      normalized.includes(
        "."
      ) &&
      normalized.includes(
        ","
      )
    ) {
      normalized =
        normalized
          .replace(
            /\./g,
            ""
          )
          .replace(
            ",",
            "."
          );
    } else if (
      normalized.includes(
        ","
      )
    ) {
      normalized =
        normalized.replace(
          ",",
          "."
        );
    }

    normalized =
      normalized.replace(
        /[^\d.]/g,
        ""
      );

    const amount =
      Number(normalized);

    return Number.isFinite(
      amount
    )
      ? amount
      : 0;
  }

  function showPermissionWarning() {
    window.alert(
      "Bu işlem için yetkiniz yok. Yalnızca yöneticiler paket kayıtlarını düzenleyebilir veya silebilir."
    );
  }

  async function handleAddCourier() {
    if (!isAdmin) {
      return;
    }

    const name =
      newCourierName.trim();

    if (
      !name ||
      processing
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await createCourier(
        name
      );

      setNewCourierName(
        ""
      );

      setShowAddCourier(
        false
      );

      await loadCouriers(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kurye eklenemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleAddPackage(
    courierId: number,
    entryType:
      CourierEntryType
  ) {
    if (processing) {
      return;
    }

    const amount =
      entryType ===
      "ONLINE"
        ? 0
        : parseAmount(
            amountInputs[
              courierId
            ] ?? ""
          );

    if (
      entryType ===
        "NORMAL" &&
      amount <= 0
    ) {
      setError(
        "Normal paket için tutar girin."
      );

      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await createCourierEntry(
        courierId,
        amount,
        isAdmin
          ? selectedDate
          : today,
        entryType
      );

      if (
        entryType ===
        "NORMAL"
      ) {
        setAmountInputs(
          (current) => ({
            ...current,
            [courierId]:
              "",
          })
        );
      }

      await loadCouriers(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Paket eklenemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteEntry(
    entryId: number
  ) {
    if (!isAdmin) {
      showPermissionWarning();
      return;
    }

    const confirmed =
      window.confirm(
        "Bu paket kaydını silmek istediğine emin misin?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await deleteCourierEntry(
        entryId
      );

      if (
        editingEntry?.entryId ===
        entryId
      ) {
        setEditingEntry(
          null
        );
      }

      await loadCouriers(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Paket silinemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleSaveEntry() {
    if (
      !isAdmin ||
      !editingEntry ||
      processing
    ) {
      return;
    }

    const amount =
      parseAmount(
        editingEntry.value
      );

    if (
      amount <= 0
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await updateCourierEntry(
        editingEntry.entryId,
        amount
      );

      setEditingEntry(
        null
      );

      await loadCouriers(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Paket düzenlenemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleStatus(
    courier: Courier
  ) {
    if (!isAdmin) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await updateCourierStatus(
        courier.id,
        !courier.active
      );

      await loadCouriers(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kurye durumu güncellenemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteCourier(
    courier: Courier
  ) {
    if (
      !isAdmin ||
      processing
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `${courier.name} isimli kuryeyi silmek istediğine emin misin?\n\nPaket geçmişi bulunan kuryeler silinmez; geçmiş kayıtları korumak için pasife alınmalıdır.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await deleteCourier(
        courier.id
      );

      await loadCouriers(
        false
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kurye silinemedi. Paket geçmişi varsa kuryeyi pasife alın."
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
            Kuryeler yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <Bike
                size={24}
                className="text-orange-500"
              />

              <h1 className="text-xl font-bold sm:text-2xl">
                Kurye Takip
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {isToday
                ? "Bugünkü paketleri kuryelere göre kaydedin."
                : `${formatDate(
                    selectedDate
                  )} paket kayıtlarını görüntülüyorsunuz.`}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                void loadCouriers()
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
              aria-label="Yenile"
            >
              <RefreshCw
                size={19}
              />
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setShowAddCourier(
                    true
                  )
                }
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-sm sm:flex-none"
              >
                <UserPlus
                  size={19}
                />

                Kurye Ekle
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {isAdmin && (
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={19}
                    className="text-orange-500"
                  />

                  <p className="text-sm font-bold">
                    Tarih Seç
                  </p>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Bugün veya geçmiş bir günü görüntüleyebilirsiniz.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={
                    selectedDate
                  }
                  max={today}
                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target
                        .value;

                    if (
                      !value ||
                      value > today
                    ) {
                      return;
                    }

                    setSelectedDate(
                      value
                    );

                    setExpandedCouriers(
                      {}
                    );

                    setEditingEntry(
                      null
                    );
                  }}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                {!isToday && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(
                        today
                      );

                      setExpandedCouriers(
                        {}
                      );

                      setEditingEntry(
                        null
                      );
                    }}
                    className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white"
                  >
                    Bugün
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>
              {error}
            </span>

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

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <SummaryCard
            icon={
              <Users
                size={20}
              />
            }
            title="Aktif Kurye"
            value={String(
              activeCouriers.length
            )}
            color="blue"
          />

          <SummaryCard
            icon={
              <Package
                size={20}
              />
            }
            title={
              isToday
                ? "Toplam Paket"
                : "Seçili Gün Paket"
            }
            value={String(
              totalPackageCount
            )}
            color="orange"
          />

          <div className="col-span-2 lg:col-span-1">
            <SummaryCard
              icon={
                <Globe2
                  size={20}
                />
              }
              title="Online Paket"
              value={String(
                totalOnlineCount
              )}
              color="indigo"
            />
          </div>
        </div>

        {visibleCouriers.length ===
        0 ? (
          <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
            <Bike
              size={30}
              className="mx-auto text-orange-500"
            />

            <h2 className="mt-4 text-lg font-bold">
              {isToday
                ? "Henüz aktif kurye yok"
                : "Bu tarihte paket kaydı yok"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {isToday
                ? isAdmin
                  ? "Paket girişi yapabilmek için önce kurye ekleyin."
                  : "Şu anda aktif kurye bulunmuyor."
                : "Başka bir tarih seçebilir veya bu güne geçmiş paket kaydı ekleyebilirsiniz."}
            </p>
          </section>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {visibleCouriers.map(
              (courier) => {
                const reversedEntries =
                  [
                    ...courier.entries,
                  ].reverse();

                const showAllEntries =
                  expandedCouriers[
                    courier.id
                  ] ?? false;

                const visibleEntries =
                  showAllEntries
                    ? reversedEntries
                    : reversedEntries.slice(
                        0,
                        5
                      );

                const onlineCount =
                  courier.entries.filter(
                    (entry) =>
                      entry.entryType ===
                      "ONLINE"
                  ).length;

                return (
                  <section
                    key={
                      courier.id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
                      <div>
                        <h2 className="font-bold">
                          {
                            courier.name
                          }
                        </h2>

                        <p
                          className={`text-xs ${
                            courier.active
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {courier.active
                            ? "Aktif Kurye"
                            : "Pasif Kurye"}
                        </p>
                      </div>

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold">
                        {
                          courier.packageCount
                        }{" "}
                        Paket
                      </span>
                    </div>

                    {courier.active && (
                      <div className="p-4 sm:p-5">
                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                          Paket Tutarı
                        </label>

                        <div className="relative">
                          <input
                            value={
                              amountInputs[
                                courier.id
                              ] ?? ""
                            }
                            onChange={(
                              event
                            ) =>
                              setAmountInputs(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  [courier.id]:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                void handleAddPackage(
                                  courier.id,
                                  "NORMAL"
                                );
                              }
                            }}
                            inputMode="decimal"
                            placeholder="0,00"
                            className="h-14 w-full rounded-xl border border-slate-200 px-4 pr-12 text-lg font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                            ₺
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={
                              processing
                            }
                            onClick={() =>
                              void handleAddPackage(
                                courier.id,
                                "NORMAL"
                              )
                            }
                            className="min-h-[52px] rounded-xl bg-orange-500 px-3 text-sm font-bold text-white disabled:opacity-50"
                          >
                            Paket Ekle
                          </button>

                          <button
                            type="button"
                            disabled={
                              processing
                            }
                            onClick={() =>
                              void handleAddPackage(
                                courier.id,
                                "ONLINE"
                              )
                            }
                            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-700 disabled:opacity-50"
                          >
                            <Globe2
                              size={
                                17
                              }
                            />

                            Online · 0 TL
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="border-y border-slate-100 bg-slate-50 p-4">
                      <div
                        className={`grid gap-4 ${
                          isAdmin
                            ? "grid-cols-3"
                            : "grid-cols-2"
                        }`}
                      >
                        <div>
                          <p className="text-xs text-slate-500">
                            Paket Adedi
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {
                              courier.packageCount
                            }
                          </p>
                        </div>

                        <div className="border-l border-slate-200 pl-4">
                          <p className="text-xs text-slate-500">
                            Online
                          </p>

                          <p className="mt-1 text-xl font-bold text-blue-600">
                            {
                              onlineCount
                            }
                          </p>
                        </div>

                        {isAdmin && (
                          <div className="border-l border-slate-200 pl-4">
                            <p className="text-xs text-slate-500">
                              Paket Tutarı
                            </p>

                            <p className="mt-1 text-lg font-bold text-orange-500">
                              {formatCurrency(
                                Number(
                                  courier.totalAmount
                                )
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <h3 className="mb-3 text-sm font-bold">
                        {isToday
                          ? "Bugünkü Paketler"
                          : `${formatDate(
                              selectedDate
                            )} Paketleri`}
                      </h3>

                      {courier.entries
                        .length ===
                      0 ? (
                        <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
                          Bu tarihte paket girişi yapılmadı.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {visibleEntries.map(
                            (
                              entry,
                              index
                            ) => {
                              const packageNumber =
                                courier
                                  .entries
                                  .length -
                                index;

                              const editing =
                                editingEntry?.entryId ===
                                entry.id;

                              const roleLabel =
                                formatRole(
                                  entry.createdByRole
                                );

                              const isOnline =
                                entry.entryType ===
                                "ONLINE";

                              return (
                                <div
                                  key={
                                    entry.id
                                  }
                                  className={`flex min-h-[76px] items-center gap-3 rounded-xl border px-3 py-2 ${
                                    isOnline
                                      ? "border-blue-100 bg-blue-50/50"
                                      : "border-slate-100"
                                  }`}
                                >
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                      isOnline
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-50 text-orange-500"
                                    }`}
                                  >
                                    #
                                    {
                                      packageNumber
                                    }
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    {editing &&
                                    isAdmin &&
                                    !isOnline ? (
                                      <input
                                        autoFocus
                                        inputMode="decimal"
                                        value={
                                          editingEntry.value
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          setEditingEntry(
                                            {
                                              entryId:
                                                entry.id,
                                              value:
                                                event
                                                  .target
                                                  .value,
                                            }
                                          )
                                        }
                                        className="h-10 w-full rounded-lg border border-orange-300 px-3 outline-none"
                                      />
                                    ) : (
                                      <>
                                        {isOnline ? (
                                          <div className="flex items-center gap-2">
                                            <Globe2
                                              size={
                                                15
                                              }
                                              className="text-blue-600"
                                            />

                                            <p className="font-bold text-blue-700">
                                              Online · 0 TL
                                            </p>
                                          </div>
                                        ) : (
                                          <p className="font-bold">
                                            {formatCurrency(
                                              Number(
                                                entry.amount
                                              )
                                            )}
                                          </p>
                                        )}

                                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                          <Clock3
                                            size={
                                              11
                                            }
                                          />

                                          {formatTime(
                                            entry.createdAt
                                          )}
                                        </p>

                                        <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
                                          Ekleyen:{" "}
                                          <span className="text-slate-700">
                                            {entry.createdByName ??
                                              "Eski kayıt"}
                                          </span>

                                          {entry.createdByName &&
                                            roleLabel && (
                                              <span className="text-slate-400">
                                                {" "}
                                                ·{" "}
                                                {
                                                  roleLabel
                                                }
                                              </span>
                                            )}
                                        </p>
                                      </>
                                    )}
                                  </div>

                                  {editing &&
                                  isAdmin &&
                                  !isOnline ? (
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleSaveEntry()
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
                                        aria-label="Kaydet"
                                      >
                                        <Check
                                          size={
                                            17
                                          }
                                        />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingEntry(
                                            null
                                          )
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"
                                        aria-label="Vazgeç"
                                      >
                                        <X
                                          size={
                                            17
                                          }
                                        />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1">
                                      {!isOnline && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (
                                              !isAdmin
                                            ) {
                                              showPermissionWarning();
                                              return;
                                            }

                                            setEditingEntry(
                                              {
                                                entryId:
                                                  entry.id,
                                                value:
                                                  String(
                                                    entry.amount
                                                  ).replace(
                                                    ".",
                                                    ","
                                                  ),
                                              }
                                            );
                                          }}
                                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            isAdmin
                                              ? "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                              : "text-slate-300"
                                          }`}
                                          aria-label="Paketi düzenle"
                                        >
                                          <Edit3
                                            size={
                                              16
                                            }
                                          />
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            !isAdmin
                                          ) {
                                            showPermissionWarning();
                                            return;
                                          }

                                          void handleDeleteEntry(
                                            entry.id
                                          );
                                        }}
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                          isAdmin
                                            ? "text-red-400 hover:bg-red-50"
                                            : "text-slate-300"
                                        }`}
                                        aria-label="Paketi sil"
                                      >
                                        <Trash2
                                          size={
                                            16
                                          }
                                        />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}

                          {courier.entries
                            .length >
                            5 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCouriers(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    [courier.id]:
                                      !showAllEntries,
                                  })
                                )
                              }
                              className="mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                              aria-expanded={
                                showAllEntries
                              }
                            >
                              {showAllEntries
                                ? "Daralt"
                                : `Tümünü Göster (${courier.entries.length})`}

                              <ChevronDown
                                size={
                                  18
                                }
                                className={`transition-transform ${
                                  showAllEntries
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                );
              }
            )}
          </div>
        )}

        {isAdmin && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() =>
                setShowManagement(
                  (value) =>
                    !value
                )
              }
              className="flex min-h-[64px] w-full items-center justify-between px-4 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Users
                  size={20}
                />

                <div className="text-left">
                  <p className="text-sm font-bold">
                    Kurye Yönetimi
                  </p>

                  <p className="text-xs text-slate-500">
                    Aktif ve pasif kuryeleri yönetin
                  </p>
                </div>
              </div>

              <ChevronDown
                size={20}
                className={`transition ${
                  showManagement
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {showManagement && (
              <div className="space-y-2 border-t border-slate-100 p-4">
                {couriers.map(
                  (courier) => (
                    <div
                      key={
                        courier.id
                      }
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {
                            courier.name
                          }
                        </p>

                        <p
                          className={`text-xs ${
                            courier.active
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {courier.active
                            ? "Aktif"
                            : "Pasif"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            void handleStatus(
                              courier
                            )
                          }
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                            courier.active
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {courier.active ? (
                            <>
                              <PowerOff
                                size={
                                  15
                                }
                              />

                              Pasife Al
                            </>
                          ) : (
                            <>
                              <Power
                                size={
                                  15
                                }
                              />

                              Aktif Et
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            void handleDeleteCourier(
                              courier
                            )
                          }
                          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                          aria-label={`${courier.name} kuryesini sil`}
                        >
                          <Trash2
                            size={
                              15
                            }
                          />

                          Sil
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {isAdmin &&
        showAddCourier && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
            <div className="w-full rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Yeni Kurye Ekle
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Çalışan kuryenin adını girin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddCourier(
                      false
                    );

                    setNewCourierName(
                      ""
                    );
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
                >
                  <X
                    size={
                      19
                    }
                  />
                </button>
              </div>

              <input
                autoFocus
                value={
                  newCourierName
                }
                onChange={(
                  event
                ) =>
                  setNewCourierName(
                    event.target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    void handleAddCourier();
                  }
                }}
                placeholder="Örn. Mehmet"
                className="mt-6 min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-400"
              />

              <button
                type="button"
                disabled={
                  processing ||
                  !newCourierName.trim()
                }
                onClick={() =>
                  void handleAddCourier()
                }
                className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white disabled:opacity-50"
              >
                {processing ? (
                  <LoaderCircle
                    size={
                      19
                    }
                    className="animate-spin"
                  />
                ) : (
                  <UserPlus
                    size={
                      19
                    }
                  />
                )}

                Kuryeyi Kaydet
              </button>
            </div>
          </div>
        )}
    </main>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  color:
    | "blue"
    | "orange"
    | "indigo";
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600",

    orange:
      "bg-orange-50 text-orange-500",

    indigo:
      "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[color]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 break-words text-lg font-bold">
        {value}
      </p>
    </div>
  );
}