"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Download, RotateCcw } from "lucide-react";
import type { Courier } from "@/lib/courier-api";

type CashDraft = { received: string; deduction: string };
type CashDrafts = Record<string, CashDraft>;

type CalculatedRow = {
  courier: Courier;
  received: number | null;
  deduction: number | null;
  expected: number;
  open: number;
  extra: number;
  invalid: boolean;
};

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Values are converted to cents to avoid floating-point rounding in the balance.
function parseLira(raw: string): number | null {
  const value = raw.trim().replace(/\s|₺/g, "");
  if (!value) return null;
  let normalized = value;
  if (value.includes(",")) {
    normalized = value.replace(/\./g, "").replace(",", ".");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return NaN;
  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) && cents <= 100000000000
    ? cents
    : NaN;
}

function moneyFromCents(cents: number) {
  return money.format(cents / 100);
}

function csvEscape(value: string) {
  return '"' + value.replace(/"/g, '""') + '"';
}

export default function CourierCashReconciliation({
  couriers,
  selectedDate,
}: {
  couriers: Courier[];
  selectedDate: string;
}) {
  const [drafts, setDrafts] = useState<CashDrafts>({});
  const [loadedDate, setLoadedDate] = useState<string | null>(null);
  const storageKey = `lezzet-kurye-mutabakat-v1:${selectedDate}`;

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
                received: typeof value.received === "string" ? value.received : "",
                deduction: typeof value.deduction === "string" ? value.deduction : "",
              };
            }
          }
        }
      }
    } catch {
      // Storage may be unavailable; calculator remains usable in this tab.
    }
    setDrafts(saved);
    setLoadedDate(selectedDate);
  }, [storageKey, selectedDate]);

  function setAmount(id: number, key: keyof CashDraft, value: string) {
    const next = {
      ...drafts,
      [id]: {
        received: drafts[id]?.received ?? "",
        deduction: drafts[id]?.deduction ?? "",
        [key]: value,
      },
    };
    setDrafts(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Not a server-side accounting record.
    }
  }

  // Couriers with a NORMAL (collectible) total, including inactive couriers with history.
  const eligibleCouriers = useMemo(
    () => couriers.filter((courier) => courier.totalAmount > 0),
    [couriers]
  );

  const rows: CalculatedRow[] = eligibleCouriers.map((courier) => {
    const draft = loadedDate === selectedDate ? drafts[courier.id] : undefined;
    const received = parseLira(draft?.received ?? "");
    const deduction = parseLira(draft?.deduction ?? "");
    const expected = Math.round(Number(courier.totalAmount) * 100);
    const invalid = Number.isNaN(received) || Number.isNaN(deduction);
    const settled = received !== null && !invalid;
    const difference = settled ? expected - received - (deduction ?? 0) : 0;
    return {
      courier,
      received: settled ? received : null,
      deduction: invalid ? null : deduction,
      expected,
      open: Math.max(difference, 0),
      extra: Math.max(-difference, 0),
      invalid,
    };
  });

  const completed = rows.filter((row) => row.received !== null);
  const totals = completed.reduce(
    (acc, row) => ({
      expected: acc.expected + row.expected,
      received: acc.received + (row.received ?? 0),
      deduction: acc.deduction + (row.deduction ?? 0),
      open: acc.open + row.open,
      extra: acc.extra + row.extra,
    }),
    { expected: 0, received: 0, deduction: 0, open: 0, extra: 0 }
  );

  function clearDate() {
    if (!window.confirm(`${selectedDate} için bu tarayıcıdaki mutabakat girişlerini temizlemek istiyor musunuz?`)) return;
    setDrafts({});
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }

  function downloadCsv() {
    const lines = [
      ["Tarih", "Kurye", "Paket Toplamı (TL)", "Alınan Kasa (TL)", "Onaylı Düşüm (TL)", "Açık (TL)", "Fazla (TL)", "Durum"].join(";"),
      ...rows.map((row) => [
        selectedDate,
        csvEscape(row.courier.name),
        (row.expected / 100).toFixed(2).replace(".", ","),
        row.received === null ? "" : (row.received / 100).toFixed(2).replace(".", ","),
        row.deduction === null ? "" : (row.deduction / 100).toFixed(2).replace(".", ","),
        row.received === null ? "" : (row.open / 100).toFixed(2).replace(".", ","),
        row.received === null ? "" : (row.extra / 100).toFixed(2).replace(".", ","),
        row.invalid ? "Geçersiz tutar" : row.received === null ? "Bekliyor" : "Hesaplandı",
      ].join(";")),
    ];
    const blob = new Blob(["\uFEFF", lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kurye-kasa-mutabakat-${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
            {selectedDate} · Alınan kasa ve onaylı düşümü girin; açık/fazla otomatik hesaplansın.
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
        Bu bölüm hesaplama taslağıdır. Girilen tutarlar yalnızca bu tarayıcıda saklanır; Günlük Kasa veya resmi muhasebe kayıtlarına otomatik işlenmez. Online (0 TL) paketler beklenen tahsilata dahil değildir.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Bu tarih için tahsilat beklenen kurye paketi bulunmuyor.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((row) => {
            const draft = loadedDate === selectedDate ? drafts[row.courier.id] : undefined;
            return (
              <div key={row.courier.id} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#082d4e]">{row.courier.name}</p>
                  <p className="text-xs font-semibold text-slate-500">Paket toplamı: <span className="text-slate-800">{moneyFromCents(row.expected)}</span></p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="block text-xs font-semibold text-slate-600">
                    Alınan kasa (₺)
                    <input type="text" inputMode="decimal" value={draft?.received ?? ""} onChange={(e) => setAmount(row.courier.id, "received", e.target.value)} placeholder="Örn. 1200,50" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-600">
                    Onaylı düşüm (₺)
                    <input type="text" inputMode="decimal" value={draft?.deduction ?? ""} onChange={(e) => setAmount(row.courier.id, "deduction", e.target.value)} placeholder="0,00" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
                  </label>
                  <div className="rounded-lg bg-red-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-red-600">Kalan açık</p>
                    <p className="mt-1 text-sm font-bold text-red-700">{row.received === null ? "—" : moneyFromCents(row.open)}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-emerald-700">Kasa fazlası</p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">{row.received === null ? "—" : moneyFromCents(row.extra)}</p>
                  </div>
                </div>
                {row.invalid && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">Geçersiz tutar. 1250,50 gibi pozitif bir değer girin.</p>}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3 xl:grid-cols-6">
        <SmallTotal title="Hesaplanan kurye" value={`${completed.length}/${rows.length}`} />
        <SmallTotal title="Beklenen" value={moneyFromCents(totals.expected)} />
        <SmallTotal title="Alınan" value={moneyFromCents(totals.received)} />
        <SmallTotal title="Düşüm" value={moneyFromCents(totals.deduction)} />
        <SmallTotal title="Toplam açık" value={moneyFromCents(totals.open)} alert />
        <SmallTotal title="Toplam fazla" value={moneyFromCents(totals.extra)} positive />
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Toplamlar yalnızca “Alınan kasa” tutarı girilmiş kuryeleri kapsar.</p>
    </section>
  );
}

function SmallTotal({title, value, alert, positive}: {title:string; value:string; alert?:boolean; positive?:boolean}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-semibold text-slate-500">{title}</p>
      <p className={`mt-1 text-sm font-bold ${alert ? "text-red-600" : positive ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
