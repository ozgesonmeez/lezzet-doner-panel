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
  ChartNoAxesCombined,
  CircleDollarSign,
  CreditCard,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  Package,
  ReceiptText,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  getReport,
  type DailyReport,
  type Report,
  type SalesChannelReport,
} from "@/lib/api";

import { useAuth } from "@/context/AuthContext";

/* =========================================================
   DATE HELPERS
========================================================= */

function toDateInputValue(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  return toDateInputValue(
    new Date()
  );
}

function getMonthStart() {
  const now = new Date();

  return toDateInputValue(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )
  );
}

/* =========================================================
   FORMATTERS
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

function formatCompactCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "tr-TR",
    {
      notation: "compact",
      maximumFractionDigits: 1,
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
      month: "short",
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
      month: "2-digit",
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
      `${value}T12:00:00`
    )
  );
}

function roleLabel(
  role:
    | "ADMIN"
    | "PAKETCI"
    | null
) {
  if (role === "ADMIN") {
    return "Yönetici";
  }

  if (role === "PAKETCI") {
    return "Paket Personeli";
  }

  return "Eski kayıt";
}

/* =========================================================
   SECURITY / EXPORT HELPERS
========================================================= */

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function escapeCsvCell(
  value:
    | string
    | number
    | null
    | undefined
) {
  let raw =
    value == null
      ? ""
      : String(value);

  /*
   * Excel / CSV formula injection koruması.
   * Kullanıcı tarafından girilmiş bir açıklama
   * =, +, -, @ ile başlarsa Excel bunu formül
   * olarak çalıştırmasın.
   */
  if (
    /^[\s]*[=+\-@]/.test(raw)
  ) {
    raw = `'${raw}`;
  }

  const escaped =
    raw.replaceAll(
      '"',
      '""'
    );

  return `"${escaped}"`;
}

function createCsv(
  rows: Array<
    Array<
      | string
      | number
      | null
      | undefined
    >
  >
) {
  return rows
    .map((row) =>
      row
        .map(escapeCsvCell)
        .join(";")
    )
    .join("\r\n");
}

function downloadTextFile(
  content: string,
  filename: string,
  type: string
) {
  const blob = new Blob(
    [content],
    {
      type,
    }
  );

  const url =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   PAGE
========================================================= */

export default function ReportsPage() {
  const { user } = useAuth();

  const isAdmin =
    user?.role === "ADMIN";

  const [
    startDate,
    setStartDate,
  ] = useState(
    getMonthStart
  );

  const [
    endDate,
    setEndDate,
  ] = useState(
    getToday
  );

  const [
    report,
    setReport,
  ] =
    useState<Report | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    exportingCsv,
    setExportingCsv,
  ] = useState(false);

  const [
    exportingPdf,
    setExportingPdf,
  ] = useState(false);

  const loadReport =
    useCallback(
      async (
        selectedStartDate: string,
        selectedEndDate: string
      ) => {
        if (
          !selectedStartDate ||
          !selectedEndDate
        ) {
          setError(
            "Başlangıç ve bitiş tarihi seçiniz."
          );

          return;
        }

        if (
          selectedEndDate <
          selectedStartDate
        ) {
          setError(
            "Bitiş tarihi başlangıç tarihinden önce olamaz."
          );

          return;
        }

        try {
          setLoading(true);
          setError(null);

          const data =
            await getReport(
              selectedStartDate,
              selectedEndDate
            );

          setReport(data);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Rapor bilgileri yüklenemedi."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    void loadReport(
      getMonthStart(),
      getToday()
    );
  }, [
    isAdmin,
    loadReport,
  ]);

  const bestCourier =
    useMemo(() => {
      if (
        !report ||
        report.couriers.length ===
          0
      ) {
        return null;
      }

      return report.couriers[0];
    }, [report]);

  const bestStaff =
    useMemo(() => {
      if (
        !report ||
        report.staff.length ===
          0
      ) {
        return null;
      }

      return report.staff[0];
    }, [report]);

  function applyToday() {
    const today =
      getToday();

    setStartDate(today);
    setEndDate(today);

    void loadReport(
      today,
      today
    );
  }

  function applyThisMonth() {
    const start =
      getMonthStart();

    const end =
      getToday();

    setStartDate(start);
    setEndDate(end);

    void loadReport(
      start,
      end
    );
  }

  function applyLastDays(
    days: number
  ) {
    const end =
      new Date();

    const start =
      new Date();

    start.setDate(
      start.getDate() -
        (days - 1)
    );

    const startValue =
      toDateInputValue(
        start
      );

    const endValue =
      toDateInputValue(
        end
      );

    setStartDate(
      startValue
    );

    setEndDate(
      endValue
    );

    void loadReport(
      startValue,
      endValue
    );
  }

  /* =======================================================
     EXCEL / CSV
  ======================================================= */

  function handleCsvExport() {
    if (
      !report ||
      exportingCsv
    ) {
      return;
    }

    try {
      setExportingCsv(true);
      setError(null);

      const rows: Array<
        Array<
          | string
          | number
          | null
          | undefined
        >
      > = [];

      rows.push([
        "LEZZET DÖNER RAPORU",
      ]);

      rows.push([
        "Başlangıç Tarihi",
        formatDate(
          report.startDate
        ),
      ]);

      rows.push([
        "Bitiş Tarihi",
        formatDate(
          report.endDate
        ),
      ]);

      rows.push([]);

      rows.push([
        "GENEL ÖZET",
      ]);

      rows.push([
        "Toplam Satış",
        report.totalIncome,
      ]);

      rows.push([
        "Günlük Giderler",
        report.dailyExpenseTotal,
      ]);

      rows.push([
        "Ay Sonu Ekstra Giderleri",
        report.extraExpenseTotal,
      ]);

      rows.push([
        "Toplam Gider",
        report.totalExpense,
      ]);

      rows.push([
        "Net",
        report.netAmount,
      ]);

      rows.push([
        "Toplam Paket",
        report.totalPackageCount,
      ]);

      rows.push([
        "Paket Toplam Tutarı",
        report.totalPackageAmount,
      ]);

      rows.push([]);
      rows.push([
        "SATIŞ KANALLARI",
      ]);

      rows.push([
        "Satış Kanalı",
        "Toplam Tutar",
      ]);

      report.salesChannels.forEach(
        (item) => {
          rows.push([
            item.channel,
            item.totalAmount,
          ]);
        }
      );

      rows.push([]);
      rows.push([
        "KURYE PERFORMANSI",
      ]);

      rows.push([
        "Kurye",
        "Paket Sayısı",
        "Paket Tutarı",
      ]);

      report.couriers.forEach(
        (courier) => {
          rows.push([
            courier.courierName,
            courier.packageCount,
            courier.totalAmount,
          ]);
        }
      );

      rows.push([]);
      rows.push([
        "PERSONEL PAKET GİRİŞLERİ",
      ]);

      rows.push([
        "Personel",
        "Rol",
        "Paket Sayısı",
        "Paket Tutarı",
      ]);

      report.staff.forEach(
        (staff) => {
          rows.push([
            staff.fullName,
            roleLabel(
              staff.role
            ),
            staff.packageCount,
            staff.totalAmount,
          ]);
        }
      );

      if (
        report.extraExpenses
          .length > 0
      ) {
        rows.push([]);

        rows.push([
          "AY SONU EKSTRA GİDERLERİ",
        ]);

        rows.push([
          "Ay",
          "Açıklama",
          "Tutar",
        ]);

        report.extraExpenses.forEach(
          (expense) => {
            rows.push([
              formatMonth(
                expense.expenseMonth
              ),
              expense.description,
              expense.amount,
            ]);
          }
        );
      }

      rows.push([]);

      rows.push([
        "GÜNLÜK DÖKÜM",
      ]);

      rows.push([
        "Tarih",
        "Satış",
        "Gider",
        "Net",
        "Paket Sayısı",
        "Paket Tutarı",
      ]);

      report.days.forEach(
        (day) => {
          rows.push([
            formatDate(
              day.date
            ),
            day.totalIncome,
            day.totalExpense,
            day.netAmount,
            day.packageCount,
            day.packageAmount,
          ]);
        }
      );

      /*
       * UTF-8 BOM:
       * Excel'in Türkçe karakterleri doğru
       * algılaması için başına ekliyoruz.
       */
      const csv =
        "\uFEFF" +
        createCsv(rows);

      downloadTextFile(
        csv,
        `lezzet-doner-rapor-${report.startDate}_${report.endDate}.csv`,
        "text/csv;charset=utf-8;"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Excel raporu oluşturulamadı."
      );
    } finally {
      setExportingCsv(false);
    }
  }

  /* =======================================================
     PDF / PRINT
  ======================================================= */

  function handlePdfExport() {
    if (
      !report ||
      exportingPdf
    ) {
      return;
    }

    try {
      setExportingPdf(true);
      setError(null);

      const printWindow =
        window.open(
          "",
          "_blank",
          "width=1100,height=850"
        );

      if (!printWindow) {
        throw new Error(
          "PDF penceresi açılamadı. Tarayıcıdaki açılır pencere engelini kontrol edin."
        );
      }

      const salesRows =
        report.salesChannels
          .map(
            (item) => `
              <tr>
                <td>
                  ${escapeHtml(
                    item.channel
                  )}
                </td>

                <td class="right">
                  ${escapeHtml(
                    formatCurrency(
                      item.totalAmount
                    )
                  )}
                </td>
              </tr>
            `
          )
          .join("");

      const courierRows =
        report.couriers
          .map(
            (item) => `
              <tr>
                <td>
                  ${escapeHtml(
                    item.courierName
                  )}
                </td>

                <td class="right">
                  ${
                    item.packageCount
                  }
                </td>

                <td class="right">
                  ${escapeHtml(
                    formatCurrency(
                      item.totalAmount
                    )
                  )}
                </td>
              </tr>
            `
          )
          .join("");

      const staffRows =
        report.staff
          .map(
            (item) => `
              <tr>
                <td>
                  ${escapeHtml(
                    item.fullName
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    roleLabel(
                      item.role
                    )
                  )}
                </td>

                <td class="right">
                  ${
                    item.packageCount
                  }
                </td>

                <td class="right">
                  ${escapeHtml(
                    formatCurrency(
                      item.totalAmount
                    )
                  )}
                </td>
              </tr>
            `
          )
          .join("");

      const extraRows =
        report.extraExpenses
          .map(
            (item) => `
              <tr>
                <td>
                  ${escapeHtml(
                    formatMonth(
                      item.expenseMonth
                    )
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.description
                  )}
                </td>

                <td class="right">
                  ${escapeHtml(
                    formatCurrency(
                      item.amount
                    )
                  )}
                </td>
              </tr>
            `
          )
          .join("");

      const dailyRows =
        report.days
          .map(
            (day) => `
              <tr>
                <td>
                  ${escapeHtml(
                    formatDate(
                      day.date
                    )
                  )}
                </td>

                <td class="right">
                  ${escapeHtml(
                    formatCurrency(
                      day.totalIncome
                    )
                  )}
                </td>

                <td class="right">
                  ${escapeHtml(
                    formatCurrency(
                      day.totalExpense
                    )
                  )}
                </td>

                <td
                  class="right ${
                    day.netAmount >=
                    0
                      ? "positive"
                      : "negative"
                  }"
                >
                  ${escapeHtml(
                    formatCurrency(
                      day.netAmount
                    )
                  )}
                </td>

                <td class="right">
                  ${
                    day.packageCount
                  }
                </td>

                <td class="right">
                  ${escapeHtml(
                    formatCurrency(
                      day.packageAmount
                    )
                  )}
                </td>
              </tr>
            `
          )
          .join("");

      printWindow.document.write(`
        <!doctype html>

        <html lang="tr">
          <head>
            <meta charset="utf-8" />

            <title>
              Lezzet Döner Raporu
            </title>

            <style>
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                padding: 32px;

                font-family:
                  -apple-system,
                  BlinkMacSystemFont,
                  "Segoe UI",
                  Arial,
                  sans-serif;

                color: #0f172a;
                background: white;
              }

              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;

                padding-bottom: 18px;
                border-bottom: 3px solid #f97316;
              }

              .brand {
                font-size: 23px;
                font-weight: 800;
              }

              .brand span {
                color: #f97316;
              }

              .subtitle {
                margin-top: 5px;
                font-size: 11px;
                color: #64748b;
              }

              .period {
                font-size: 11px;
                color: #475569;
                text-align: right;
              }

              .metrics {
                display: grid;
                grid-template-columns:
                  repeat(4, 1fr);

                gap: 10px;
                margin-top: 22px;
              }

              .metric {
                padding: 13px;

                border:
                  1px solid #e2e8f0;

                border-radius: 10px;
              }

              .metric-label {
                margin-bottom: 7px;

                color: #64748b;
                font-size: 9px;
                font-weight: 600;
              }

              .metric-value {
                font-size: 15px;
                font-weight: 800;
              }

              .positive {
                color: #059669;
              }

              .negative {
                color: #dc2626;
              }

              h2 {
                margin:
                  24px 0 10px;

                font-size: 14px;
              }

              table {
                width: 100%;

                border-collapse:
                  collapse;

                font-size: 10px;
              }

              th {
                background: #f8fafc;

                color: #475569;
                font-weight: 700;
                text-align: left;
              }

              th,
              td {
                padding: 7px 8px;

                border-bottom:
                  1px solid #e2e8f0;
              }

              .right {
                text-align: right;
              }

              .footer {
                margin-top: 28px;
                padding-top: 12px;

                border-top:
                  1px solid #e2e8f0;

                color: #94a3b8;
                font-size: 8px;
                text-align: center;
              }

              @page {
                size: A4;
                margin: 12mm;
              }

              @media print {
                body {
                  padding: 0;
                }

                table,
                tr,
                td,
                th {
                  page-break-inside:
                    avoid;
                }
              }
            </style>
          </head>

          <body>
            <header class="header">
              <div>
                <div class="brand">
                  LEZZET
                  <span>DÖNER</span>
                </div>

                <div class="subtitle">
                  Yönetim Paneli · Finans ve Operasyon Raporu
                </div>
              </div>

              <div class="period">
                <strong>
                  Rapor Dönemi
                </strong>

                <br />

                ${escapeHtml(
                  formatDate(
                    report.startDate
                  )
                )}

                –

                ${escapeHtml(
                  formatDate(
                    report.endDate
                  )
                )}
              </div>
            </header>

            <section class="metrics">
              <div class="metric">
                <div class="metric-label">
                  TOPLAM SATIŞ
                </div>

                <div class="metric-value positive">
                  ${escapeHtml(
                    formatCurrency(
                      report.totalIncome
                    )
                  )}
                </div>
              </div>

              <div class="metric">
                <div class="metric-label">
                  TOPLAM GİDER
                </div>

                <div class="metric-value negative">
                  ${escapeHtml(
                    formatCurrency(
                      report.totalExpense
                    )
                  )}
                </div>
              </div>

              <div class="metric">
                <div class="metric-label">
                  NET
                </div>

                <div
                  class="metric-value ${
                    report.netAmount >=
                    0
                      ? "positive"
                      : "negative"
                  }"
                >
                  ${escapeHtml(
                    formatCurrency(
                      report.netAmount
                    )
                  )}
                </div>
              </div>

              <div class="metric">
                <div class="metric-label">
                  TOPLAM PAKET
                </div>

                <div class="metric-value">
                  ${
                    report.totalPackageCount
                  }
                </div>

                <div class="subtitle">
                  ${escapeHtml(
                    formatCurrency(
                      report.totalPackageAmount
                    )
                  )}
                </div>
              </div>
            </section>

            <h2>
              Gider Özeti
            </h2>

            <table>
              <tbody>
                <tr>
                  <td>
                    Günlük giderler
                  </td>

                  <td class="right">
                    ${escapeHtml(
                      formatCurrency(
                        report.dailyExpenseTotal
                      )
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Ay sonu ekstra giderleri
                  </td>

                  <td class="right">
                    ${escapeHtml(
                      formatCurrency(
                        report.extraExpenseTotal
                      )
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>
                      Toplam gider
                    </strong>
                  </td>

                  <td class="right">
                    <strong>
                      ${escapeHtml(
                        formatCurrency(
                          report.totalExpense
                        )
                      )}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <h2>
              Satış Kanalları
            </h2>

            <table>
              <thead>
                <tr>
                  <th>
                    Satış Kanalı
                  </th>

                  <th class="right">
                    Toplam
                  </th>
                </tr>
              </thead>

              <tbody>
                ${
                  salesRows ||
                  `
                    <tr>
                      <td colspan="2">
                        Kayıt yok
                      </td>
                    </tr>
                  `
                }
              </tbody>
            </table>

            <h2>
              Kurye Performansı
            </h2>

            <table>
              <thead>
                <tr>
                  <th>
                    Kurye
                  </th>

                  <th class="right">
                    Paket
                  </th>

                  <th class="right">
                    Tutar
                  </th>
                </tr>
              </thead>

              <tbody>
                ${
                  courierRows ||
                  `
                    <tr>
                      <td colspan="3">
                        Kayıt yok
                      </td>
                    </tr>
                  `
                }
              </tbody>
            </table>

            <h2>
              Personel Paket Girişleri
            </h2>

            <table>
              <thead>
                <tr>
                  <th>
                    Personel
                  </th>

                  <th>
                    Rol
                  </th>

                  <th class="right">
                    Paket
                  </th>

                  <th class="right">
                    Tutar
                  </th>
                </tr>
              </thead>

              <tbody>
                ${
                  staffRows ||
                  `
                    <tr>
                      <td colspan="4">
                        Kayıt yok
                      </td>
                    </tr>
                  `
                }
              </tbody>
            </table>

            ${
              report
                .extraExpenses
                .length > 0
                ? `
                  <h2>
                    Ay Sonu Ekstra Giderleri
                  </h2>

                  <table>
                    <thead>
                      <tr>
                        <th>
                          Ay
                        </th>

                        <th>
                          Açıklama
                        </th>

                        <th class="right">
                          Tutar
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      ${extraRows}
                    </tbody>
                  </table>
                `
                : ""
            }

            <h2>
              Günlük Döküm
            </h2>

            <table>
              <thead>
                <tr>
                  <th>
                    Tarih
                  </th>

                  <th class="right">
                    Satış
                  </th>

                  <th class="right">
                    Gider
                  </th>

                  <th class="right">
                    Net
                  </th>

                  <th class="right">
                    Paket
                  </th>

                  <th class="right">
                    Paket Tutarı
                  </th>
                </tr>
              </thead>

              <tbody>
                ${dailyRows}
              </tbody>
            </table>

            <footer class="footer">
              Lezzet Döner Yönetim Paneli tarafından oluşturulmuştur.
            </footer>

            <script>
              window.onload = function () {
                setTimeout(
                  function () {
                    window.print();
                  },
                  250
                );
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "PDF raporu oluşturulamadı."
      );
    } finally {
      window.setTimeout(
        () =>
          setExportingPdf(
            false
          ),
        500
      );
    }
  }

  /* =======================================================
     ACCESS CONTROL
  ======================================================= */

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X size={22} />
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Yetkiniz yok
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Raporlar yalnızca yönetici hesabından görüntülenebilir.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ChartNoAxesCombined
                  size={24}
                  className="text-orange-500"
                />

                <h1 className="text-xl font-bold sm:text-2xl">
                  Raporlar
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Satış, gider, kurye ve personel performansını inceleyin
              </p>
            </div>

            <div className="flex gap-2">
              {report && (
                <>
                  <button
                    type="button"
                    onClick={
                      handlePdfExport
                    }
                    disabled={
                      exportingPdf
                    }
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 disabled:opacity-50"
                  >
                    {exportingPdf ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <FileText
                        size={17}
                      />
                    )}

                    PDF
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleCsvExport
                    }
                    disabled={
                      exportingCsv
                    }
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 disabled:opacity-50"
                  >
                    {exportingCsv ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <FileSpreadsheet
                        size={17}
                      />
                    )}

                    Excel
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() =>
                  void loadReport(
                    startDate,
                    endDate
                  )
                }
                disabled={loading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50"
                aria-label="Raporu yenile"
              >
                <RefreshCw
                  size={18}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* DATE FILTER */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={19}
              className="text-orange-500"
            />

            <h2 className="text-sm font-bold">
              Tarih Aralığı
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Başlangıç
              </span>

              <input
                type="date"
                value={startDate}
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target
                      .value
                  )
                }
                className="min-h-[50px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Bitiş
              </span>

              <input
                type="date"
                value={endDate}
                max={getToday()}
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target
                      .value
                  )
                }
                className="min-h-[50px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <PresetButton
              label="Bugün"
              onClick={
                applyToday
              }
            />

            <PresetButton
              label="Son 7 Gün"
              onClick={() =>
                applyLastDays(7)
              }
            />

            <PresetButton
              label="Son 30 Gün"
              onClick={() =>
                applyLastDays(30)
              }
            />

            <PresetButton
              label="Bu Ay"
              onClick={
                applyThisMonth
              }
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void loadReport(
                startDate,
                endDate
              )
            }
            disabled={loading}
            className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <ChartNoAxesCombined
                size={18}
              />
            )}

            Raporu Getir
          </button>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading &&
        !report ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={34}
                className="mx-auto animate-spin text-orange-500"
              />

              <p className="mt-3 text-sm text-slate-500">
                Rapor hazırlanıyor...
              </p>
            </div>
          </div>
        ) : report ? (
          <>
            {/* PERIOD */}

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Seçili dönem
              </p>

              <p className="mt-1 text-sm font-bold">
                {formatDate(
                  report.startDate
                )}{" "}
                –{" "}
                {formatDate(
                  report.endDate
                )}
              </p>
            </div>

            {/* METRICS */}

            <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard
                title="Toplam Satış"
                value={formatCurrency(
                  report.totalIncome
                )}
                icon={
                  <TrendingUp
                    size={20}
                  />
                }
                tone="green"
              />

              <MetricCard
                title="Toplam Gider"
                value={formatCurrency(
                  report.totalExpense
                )}
                icon={
                  <TrendingDown
                    size={20}
                  />
                }
                tone="red"
              />

              <MetricCard
                title="Net"
                value={formatCurrency(
                  report.netAmount
                )}
                icon={
                  <CircleDollarSign
                    size={20}
                  />
                }
                tone={
                  report.netAmount >=
                  0
                    ? "green"
                    : "red"
                }
              />

              <MetricCard
                title="Toplam Paket"
                value={String(
                  report.totalPackageCount
                )}
                secondary={formatCurrency(
                  report.totalPackageAmount
                )}
                icon={
                  <Package
                    size={20}
                  />
                }
                tone="orange"
              />
            </section>

            {/* GRAPHS */}

            <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ReportSection
                title="Günlük Finans Grafiği"
                icon={
                  <ChartNoAxesCombined
                    size={19}
                  />
                }
              >
                <DailyTrendChart
                  days={
                    report.days
                  }
                />
              </ReportSection>

              <ReportSection
                title="Satış Dağılımı"
                icon={
                  <CreditCard
                    size={19}
                  />
                }
              >
                <SalesDonutChart
                  items={
                    report.salesChannels
                  }
                  total={
                    report.totalIncome
                  }
                />
              </ReportSection>
            </section>

            {/* SUMMARY */}

            <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ReportSection
                title="Gider Özeti"
                icon={
                  <ReceiptText
                    size={19}
                  />
                }
              >
                <ValueRow
                  label="Günlük giderler"
                  value={formatCurrency(
                    report.dailyExpenseTotal
                  )}
                />

                <ValueRow
                  label="Ay sonu ekstra giderleri"
                  value={formatCurrency(
                    report.extraExpenseTotal
                  )}
                />

                <ValueRow
                  label="Toplam gider"
                  value={formatCurrency(
                    report.totalExpense
                  )}
                  strong
                />
              </ReportSection>

              <ReportSection
                title="Öne Çıkanlar"
                icon={
                  <ChartNoAxesCombined
                    size={19}
                  />
                }
              >
                <ValueRow
                  label="En çok paket taşıyan kurye"
                  value={
                    bestCourier
                      ? `${bestCourier.courierName} · ${bestCourier.packageCount} paket`
                      : "Kayıt yok"
                  }
                />

                <ValueRow
                  label="En çok paket girişi yapan"
                  value={
                    bestStaff
                      ? `${bestStaff.fullName} · ${bestStaff.packageCount} paket`
                      : "Kayıt yok"
                  }
                />

                <ValueRow
                  label="Paket toplam tutarı"
                  value={formatCurrency(
                    report.totalPackageAmount
                  )}
                  strong
                />
              </ReportSection>
            </section>

            {/* SALES CHANNELS */}

            <ReportSection
              className="mt-5"
              title="Satış Kanalları"
              icon={
                <CreditCard
                  size={19}
                />
              }
            >
              {report
                .salesChannels
                .length === 0 ? (
                <EmptyText text="Bu tarih aralığında satış kaydı yok." />
              ) : (
                <div className="space-y-4">
                  {report.salesChannels.map(
                    (channel) => {
                      const maxAmount =
                        Math.max(
                          ...report.salesChannels.map(
                            (item) =>
                              item.totalAmount
                          )
                        );

                      const width =
                        maxAmount > 0
                          ? Math.max(
                              4,
                              (channel.totalAmount /
                                maxAmount) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={
                            channel.channel
                          }
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-600">
                              {
                                channel.channel
                              }
                            </span>

                            <span className="text-sm font-bold">
                              {formatCurrency(
                                channel.totalAmount
                              )}
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-orange-500 transition-all"
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </ReportSection>

            {/* COURIER + STAFF */}

            <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ReportSection
                title="Kurye Performansı"
                icon={
                  <Bike
                    size={19}
                  />
                }
              >
                {report
                  .couriers
                  .length === 0 ? (
                  <EmptyText text="Bu tarih aralığında kurye paketi yok." />
                ) : (
                  <div className="space-y-2">
                    {report.couriers.map(
                      (
                        courier,
                        index
                      ) => (
                        <div
                          key={
                            courier.courierId
                          }
                          className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-600">
                            #
                            {index +
                              1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {
                                courier.courierName
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {
                                courier.packageCount
                              }{" "}
                              paket
                            </p>
                          </div>

                          <p className="text-sm font-bold text-emerald-600">
                            {formatCurrency(
                              courier.totalAmount
                            )}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </ReportSection>

              <ReportSection
                title="Personel Paket Girişleri"
                icon={
                  <UserRound
                    size={19}
                  />
                }
              >
                {report.staff
                  .length === 0 ? (
                  <EmptyText text="Bu tarih aralığında personel paket girişi yok." />
                ) : (
                  <div className="space-y-2">
                    {report.staff.map(
                      (
                        staff,
                        index
                      ) => (
                        <div
                          key={
                            staff.userId ??
                            `old-${index}`
                          }
                          className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <UserRound
                              size={
                                17
                              }
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {
                                staff.fullName
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {roleLabel(
                                staff.role
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold">
                              {
                                staff.packageCount
                              }{" "}
                              paket
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatCurrency(
                                staff.totalAmount
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </ReportSection>
            </section>

            {/* EXTRA EXPENSES */}

            {report.extraExpenses
              .length > 0 && (
              <ReportSection
                className="mt-5"
                title="Ay Sonu Ekstra Giderleri"
                icon={
                  <WalletCards
                    size={19}
                  />
                }
              >
                <div className="space-y-2">
                  {report.extraExpenses.map(
                    (expense) => (
                      <div
                        key={
                          expense.id
                        }
                        className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {
                              expense.description
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatMonth(
                              expense.expenseMonth
                            )}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-red-600">
                          {formatCurrency(
                            expense.amount
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </ReportSection>
            )}

            {/* DAILY TABLE */}

            <ReportSection
              className="mt-5"
              title="Günlük Döküm"
              icon={
                <CalendarDays
                  size={19}
                />
              }
            >
              <div className="space-y-3 lg:hidden">
                {report.days.map(
                  (day) => (
                    <div
                      key={day.date}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">
                          {formatDate(
                            day.date
                          )}
                        </p>

                        <span
                          className={`text-sm font-bold ${
                            day.netAmount >=
                            0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            day.netAmount
                          )}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <SmallValue
                          label="Satış"
                          value={formatCurrency(
                            day.totalIncome
                          )}
                        />

                        <SmallValue
                          label="Gider"
                          value={formatCurrency(
                            day.totalExpense
                          )}
                        />

                        <SmallValue
                          label="Paket"
                          value={`${day.packageCount}`}
                        />

                        <SmallValue
                          label="Paket Tutarı"
                          value={formatCurrency(
                            day.packageAmount
                          )}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-3 font-semibold">
                        Tarih
                      </th>

                      <th className="px-3 py-3 text-right font-semibold">
                        Satış
                      </th>

                      <th className="px-3 py-3 text-right font-semibold">
                        Gider
                      </th>

                      <th className="px-3 py-3 text-right font-semibold">
                        Net
                      </th>

                      <th className="px-3 py-3 text-right font-semibold">
                        Paket
                      </th>

                      <th className="px-3 py-3 text-right font-semibold">
                        Paket Tutarı
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.days.map(
                      (day) => (
                        <tr
                          key={day.date}
                          className="border-b border-slate-100 text-sm last:border-0"
                        >
                          <td className="px-3 py-3 font-semibold">
                            {formatDate(
                              day.date
                            )}
                          </td>

                          <td className="px-3 py-3 text-right">
                            {formatCurrency(
                              day.totalIncome
                            )}
                          </td>

                          <td className="px-3 py-3 text-right">
                            {formatCurrency(
                              day.totalExpense
                            )}
                          </td>

                          <td
                            className={`px-3 py-3 text-right font-bold ${
                              day.netAmount >=
                              0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(
                              day.netAmount
                            )}
                          </td>

                          <td className="px-3 py-3 text-right">
                            {
                              day.packageCount
                            }
                          </td>

                          <td className="px-3 py-3 text-right">
                            {formatCurrency(
                              day.packageAmount
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSection>
          </>
        ) : null}
      </div>
    </main>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function PresetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
    >
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  secondary,
  icon,
  tone,
}: {
  title: string;
  value: string;
  secondary?: string;
  icon: ReactNode;
  tone:
    | "green"
    | "red"
    | "orange"
    | "blue";
}) {
  const styles = {
    green:
      "bg-emerald-50 text-emerald-600",

    red:
      "bg-red-50 text-red-600",

    orange:
      "bg-orange-50 text-orange-600",

    blue:
      "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 break-words text-lg font-bold">
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

function ReportSection({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="text-orange-500">
          {icon}
        </div>

        <h2 className="text-sm font-bold">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function ValueRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={
          strong
            ? "text-sm font-bold text-slate-900"
            : "text-sm font-semibold text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}

function SmallValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function EmptyText({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-7 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

/* =========================================================
   SALES DONUT
========================================================= */

function SalesDonutChart({
  items,
  total,
}: {
  items: SalesChannelReport[];
  total: number;
}) {
  const colors = [
    "#f97316",
    "#0ea5e9",
    "#10b981",
    "#8b5cf6",
    "#eab308",
    "#ec4899",
    "#64748b",
  ];

  if (
    items.length === 0 ||
    total <= 0
  ) {
    return (
      <EmptyText text="Grafik için satış verisi bulunmuyor." />
    );
  }

  let current = 0;

  const gradient =
    items
      .map(
        (
          item,
          index
        ) => {
          const percentage =
            (item.totalAmount /
              total) *
            100;

          const start =
            current;

          const end =
            current +
            percentage;

          current = end;

          return `${
            colors[
              index %
                colors.length
            ]
          } ${start}% ${end}%`;
        }
      )
      .join(", ");

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div
        className="relative h-44 w-44 shrink-0 rounded-full"
        style={{
          background:
            `conic-gradient(${gradient})`,
        }}
      >
        <div className="absolute inset-[27px] flex flex-col items-center justify-center rounded-full bg-white text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Satış
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatCurrency(
              total
            )}
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 space-y-2">
        {items.map(
          (
            item,
            index
          ) => {
            const percentage =
              total > 0
                ? (item.totalAmount /
                    total) *
                  100
                : 0;

            return (
              <div
                key={
                  item.channel
                }
                className="flex items-center gap-2"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      colors[
                        index %
                          colors.length
                      ],
                  }}
                />

                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                  {item.channel}
                </span>

                <span className="text-xs font-bold text-slate-700">
                  {percentage.toFixed(
                    1
                  )}
                  %
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DAILY TREND SVG
========================================================= */

function DailyTrendChart({
  days,
}: {
  days: DailyReport[];
}) {
  if (
    days.length === 0
  ) {
    return (
      <EmptyText text="Grafik için günlük veri bulunmuyor." />
    );
  }

  const width = 780;
  const height = 260;

  const left = 58;
  const right = 20;
  const top = 22;
  const bottom = 38;

  const chartWidth =
    width -
    left -
    right;

  const chartHeight =
    height -
    top -
    bottom;

  const allValues =
    days.flatMap(
      (day) => [
        day.totalIncome,
        day.totalExpense,
        day.netAmount,
        0,
      ]
    );

  let maxValue =
    Math.max(
      ...allValues
    );

  let minValue =
    Math.min(
      ...allValues
    );

  if (
    maxValue === minValue
  ) {
    maxValue += 1;
    minValue -= 1;
  }

  const valueRange =
    maxValue -
    minValue;

  function getX(
    index: number
  ) {
    if (
      days.length === 1
    ) {
      return (
        left +
        chartWidth / 2
      );
    }

    return (
      left +
      (index /
        (days.length -
          1)) *
        chartWidth
    );
  }

  function getY(
    value: number
  ) {
    return (
      top +
      ((maxValue -
        value) /
        valueRange) *
        chartHeight
    );
  }

  function createPath(
    key:
      | "totalIncome"
      | "totalExpense"
      | "netAmount"
  ) {
    return days
      .map(
        (
          day,
          index
        ) => {
          const prefix =
            index === 0
              ? "M"
              : "L";

          return `${prefix} ${getX(
            index
          )} ${getY(
            day[key]
          )}`;
        }
      )
      .join(" ");
  }

  const gridSteps = 4;

  const labelEvery =
    Math.max(
      1,
      Math.ceil(
        days.length / 6
      )
    );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold">
        <ChartLegend
          label="Satış"
          colorClass="bg-emerald-500"
        />

        <ChartLegend
          label="Gider"
          colorClass="bg-red-500"
        />

        <ChartLegend
          label="Net"
          colorClass="bg-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[720px]"
          role="img"
          aria-label="Günlük satış, gider ve net grafiği"
        >
          {Array.from({
            length:
              gridSteps + 1,
          }).map(
            (
              _,
              index
            ) => {
              const ratio =
                index /
                gridSteps;

              const value =
                maxValue -
                valueRange *
                  ratio;

              const y =
                top +
                chartHeight *
                  ratio;

              return (
                <g key={index}>
                  <line
                    x1={left}
                    y1={y}
                    x2={
                      width -
                      right
                    }
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />

                  <text
                    x={
                      left - 8
                    }
                    y={
                      y + 4
                    }
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                  >
                    {formatCompactCurrency(
                      value
                    )}
                  </text>
                </g>
              );
            }
          )}

          {minValue <=
            0 &&
            maxValue >=
              0 && (
              <line
                x1={left}
                y1={getY(0)}
                x2={
                  width -
                  right
                }
                y2={getY(0)}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

          <path
            d={createPath(
              "totalIncome"
            )}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={createPath(
              "totalExpense"
            )}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={createPath(
              "netAmount"
            )}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {days.map(
            (
              day,
              index
            ) => {
              if (
                index %
                  labelEvery !==
                  0 &&
                index !==
                  days.length - 1
              ) {
                return null;
              }

              return (
                <text
                  key={day.date}
                  x={getX(
                    index
                  )}
                  y={
                    height -
                    10
                  }
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {formatShortDate(
                    day.date
                  )}
                </text>
              );
            }
          )}
        </svg>
      </div>
    </div>
  );
}

function ChartLegend({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-slate-500">
      <span
        className={`h-2.5 w-2.5 rounded-full ${colorClass}`}
      />

      {label}
    </div>
  );
}