"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Download, RotateCcw } from "lucide-react";
import type { Courier } from "@/lib/courier-api";

type CashDraft = {
  daytime: string;
  cash: string;
  creditCard: string;
  metropol: string;
};
type CashDrafts = Record<string, CashDraft>;
type CashRow = {
  courier: Courier;
  expected: number;
  daytime: number | null;
  cash: number | null;
  creditCard: number | null;
  metropol: number | null;
  endOfDay: number;
  open: number;
  extra: number;
  hasEntry: boolean;
  valid: boolean;
};

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Kuruş cinsinden hesaplayarak para yuvarlama hatalarını önle.
function parseLira(raw: string): number | null {
  const value = raw.trim().replace(/\s|₺/g, "");
  if (!value) return null;
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return NaN;
  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) && cents <= 100000000000 ? cents : NaN;
}

function moneyFromCents(cents: number) {
  return money.format(cents / 100);
}

function csvEscape(value: string) {
  // Kullanıcının yazdığı metnin elektronik tabloda formül olarak çalışmasını engelle.
  const safe = /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}

function csvMoney(value: number | null) {
  if (value === null) return "";
  return Number.isNaN(value) ? "Hatalı" : (value / 100).toFixed(2).replace(".", ",");
}

const emptyDraft = (): CashDraft => ({ daytime: "", cash: "", creditCard: "", metropol: "" });

export default function CourierCashReconciliation({
  couriers,
  selectedDate,
}: {
  couriers: Courier[];
  selectedDate: string;
}) {
  const [drafts, setDrafts] = useState<CashDrafts>({});
  const [loadedDate, setLoadedDate] = useState<string | null>(null);
  // V2'nin tek 'endOfDay' alanını nakit/kart/Metropol'e tahminen atama.
  // Eski v1/v2 taslakları tarayıcıda korunur; yeni v3 ayrı tutulur.
  const storageKey = `lezzet-kurye-mutabakat-v3:${selectedDate}`;

  useEffect(() => {
    let saved: CashDrafts = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          for (const [id, candidate] of Object.entries(parsed)) {
            if (candidate && typeof candidate === "object") {
              const value = candidate as Partial<CashDraft>;
              saved[id] = {
                daytime: typeof value.daytime === "string" ? value.daytime : "",
                cash: typeof value.cash === "string" ? value.cash : "",
                creditCard: typeof value.creditCard === "string" ? value.creditCard : "",
                metropol: typeof value.metropol === "string" ? value.metropol : "",
              };
            }
          }
        }
      }
    } catch {
      // Tarayıcı depolaması kapalıysa hesaplama bu oturumda yine çalışabilir.
    }
    setDrafts(saved);
    setLoadedDate(selectedDate);
  }, [selectedDate, storageKey]);

  useEffect(() => {
    if (loadedDate !== selectedDate) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(drafts));
    } catch {
      // Kaydedilemese bile ekranda hesaplama devam eder.
    }
  }, [drafts, storageKey, loadedDate, selectedDate]);

  function setAmount(id: number, key: keyof CashDraft, value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...emptyDraft(), ...current[id], [key]: value },
    }));
  }

  // Online (0 TL) olarak kaydedilen paketler mevcut beklenen tahsilata dahil değil.
  const eligibleCouriers = useMemo(
    () => couriers.filter((courier) => Number(courier.totalAmount) > 0),
    [couriers]
  );

  const rows: CashRow[] = eligibleCouriers.map((courier) => {
    const draft = loadedDate === selectedDate ? drafts[courier.id] : undefined;
    const daytime = parseLira(draft?.daytime ?? "");
    const cash = parseLira(draft?.cash ?? "");
    const creditCard = parseLira(draft?.creditCard ?? "");
    const metropol = parseLira(draft?.metropol ?? "");
    const inputAmounts = [daytime, cash, creditCard, metropol];
    const hasEntry = inputAmounts.some((v) => v !== null);
    const valid = hasEntry && inputAmounts.every((v) => v === null || !Number.isNaN(v));
    const expected = Math.round(Number(courier.totalAmount) * 100);
    const endOfDay = valid ? (cash ?? 0) + (creditCard ?? 0) + (metropol ?? 0) : 0;
    const difference = valid ? expected - (daytime ?? 0) - endOfDay : 0;
    return {
      courier, expected, daytime, cash, creditCard, metropol, endOfDay, hasEntry, valid,
      open: valid ? Math.max(difference, 0) : 0,
      extra: valid ? Math.max(-difference, 0) : 0,
    };
  });

  const completed = rows.filter((row) => row.valid);
  const totals = completed.reduce(
    (acc, row) => ({
      expected: acc.expected + row.expected,
      daytime: acc.daytime + (row.daytime ?? 0),
      cash: acc.cash + (row.cash ?? 0),
      creditCard: acc.creditCard + (row.creditCard ?? 0),
      metropol: acc.metropol + (row.metropol ?? 0),
      endOfDay: acc.endOfDay + row.endOfDay,
      open: acc.open + row.open,
      extra: acc.extra + row.extra,
    }),
    { expected: 0, daytime: 0, cash: 0, creditCard: 0, metropol: 0, endOfDay: 0, open: 0, extra: 0 }
  );

  function clearDate() {
    if (!window.confirm(`${selectedDate} için bu tarayıcıdaki yeni hesaplama girişlerini temizlemek istiyor musunuz?`)) return;
    setDrafts({});
    try { localStorage.removeItem(storageKey); } catch { /* saklama kapalı olabilir */ }
  }

  function downloadCsv() {
    const lines = [
      ["Tarih", "Kurye", "Paket Toplamı (TL)", "Gün İçi Kasaya Alınan (TL)", "Gün Sonu Nakit (TL)", "Gün Sonu Kredi Kartı (TL)", "Gün Sonu Metropol (TL)", "Gün Sonu Toplam (TL)", "Kalan Açık (TL)", "Kasa Fazlası (TL)", "Durum"].join(";"),
      ...rows.map((row) => [
        selectedDate,
        csvEscape(row.courier.name),
        csvMoney(row.expected),
        csvMoney(row.daytime),
        csvMoney(row.cash),
        csvMoney(row.creditCard),
        csvMoney(row.metropol),
        row.valid ? csvMoney(row.endOfDay) : "",
        row.valid ? csvMoney(row.open) : "",
        row.valid ? csvMoney(row.extra) : "",
        row.valid ? "Hesaplandı" : row.hasEntry ? "Geçersiz tutar" : "Bekliyor",
      ].join(";")),
    ];
    const blob = new Blob(["\uFEFF", lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kurye-kasa-mutabakat-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Kurye kasa mutabakatı">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-[#082d4e]">
            <Calculator size={19} className="text-orange-500" />
            <h2 className="text-base font-bold">Kurye Kasa Mutabakatı</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {selectedDate} · Gün içi kasaya alınan tutarı ve gün sonu nakit, kredi kartı, Metropol teslimlerini girin; toplam, açık ve fazla otomatik hesaplansın.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={downloadCsv} disabled={rows.length === 0} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <Download size={15} /> CSV
          </button>
          <button type="button" onClick={clearDate} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <RotateCcw size={15} /> Temizle
          </button>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
        Bu bölüm hesaplama taslağıdır. Tutarlar yalnızca bu tarayıcıda saklanır; Günlük Kasa kayıtlarına otomatik işlenmez. Eski tek alanlı gün sonu taslakları korunur ama üç ödeme türüne tahmini olarak dağıtılmaz. Online (0 TL) paketler beklenen tahsilata dahil değildir.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Bu tarih için tahsilat beklenen kurye paketi bulunmuyor.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => {
            const draft = loadedDate === selectedDate ? drafts[row.courier.id] : undefined;
            return (
              <div key={row.courier.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#082d4e]">{row.courier.name}</p>
                  <p className="text-xs font-semibold text-slate-500">Paket toplamı: <span className="text-slate-800">{moneyFromCents(row.expected)}</span></p>
                </div>
                <label className="block max-w-sm text-xs font-semibold text-slate-600">
                  Gün İçinde Kasaya Alınan (₺)
                  <input type="text" inputMode="decimal" value={draft?.daytime ?? ""} onChange={(event) => setAmount(row.courier.id, "daytime", event.target.value)} placeholder="Örn. 1000,00" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
                </label>
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="mb-2 text-xs font-bold text-[#082d4e]">Gün Sonunda Teslim Edilen</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-xs font-semibold text-slate-600">
                      Nakit (₺)
                      <input type="text" inputMode="decimal" value={draft?.cash ?? ""} onChange={(event) => setAmount(row.courier.id, "cash", event.target.value)} placeholder="0,00" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                      Kredi Kartı (₺)
                      <input type="text" inputMode="decimal" value={draft?.creditCard ?? ""} onChange={(event) => setAmount(row.courier.id, "creditCard", event.target.value)} placeholder="0,00" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                      Metropol (₺)
                      <input type="text" inputMode="decimal" value={draft?.metropol ?? ""} onChange={(event) => setAmount(row.courier.id, "metropol", event.target.value)} placeholder="0,00" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                    <span className="text-xs font-bold text-slate-600">Gün Sonu Toplam Teslim</span>
                    <span className="text-sm font-black text-[#082d4e]">{row.valid ? moneyFromCents(row.endOfDay) : "—"}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-red-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-red-600">Kalan açık</p>
                    <p className="mt-1 text-sm font-bold text-red-700">{row.valid ? moneyFromCents(row.open) : "—"}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-emerald-700">Kasa fazlası</p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">{row.valid ? moneyFromCents(row.extra) : "—"}</p>
                  </div>
                </div>
                {row.hasEntry && !row.valid && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">Geçersiz tutar. 1250,50 gibi pozitif bir değer girin.</p>}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <SmallTotal title="Hesaplanan kurye" value={`${completed.length}/${rows.length}`} />
        <SmallTotal title="Beklenen paket" value={moneyFromCents(totals.expected)} />
        <SmallTotal title="Gün içi alınan" value={moneyFromCents(totals.daytime)} />
        <SmallTotal title="Gün sonu nakit" value={moneyFromCents(totals.cash)} />
        <SmallTotal title="Gün sonu kredi kartı" value={moneyFromCents(totals.creditCard)} />
        <SmallTotal title="Gün sonu Metropol" value={moneyFromCents(totals.metropol)} />
        <SmallTotal title="Gün sonu toplam" value={moneyFromCents(totals.endOfDay)} />
        <SmallTotal title="Toplam açık" value={moneyFromCents(totals.open)} alert />
        <SmallTotal title="Toplam fazla" value={moneyFromCents(totals.extra)} positive />
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Toplamlar yalnızca en az bir tutar girilmiş, geçerli hesabı olan kuryeleri kapsar. Boş alanlar 0 ₺ kabul edilir; tüm alanlar boşsa hesaplama yapılmaz.</p>
    </section>
  );
}

function SmallTotal({ title, value, alert, positive }: { title: string; value: string; alert?: boolean; positive?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-semibold text-slate-500">{title}</p>
      <p className={`mt-1 text-sm font-bold ${alert ? "text-red-600" : positive ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
