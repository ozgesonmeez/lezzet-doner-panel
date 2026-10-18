"use client";

import { useEffect, useState } from "react";
import {
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";

import {
  createMenuCategory,
  deleteMenuCategory,
  updateMenuCategory,
  type MenuCategory,
  type MenuCategoryInput,
} from "@/lib/menu-api";

type Props = {
  open: boolean;
  category?: MenuCategory | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export default function CategoryModal({
  open,
  category,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(category);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (category) {
      setName(category.name);
      setDescription(category.description ?? "");
      setSortOrder(String(category.sortOrder));
      setActive(category.active);
    } else {
      setName("");
      setDescription("");
      setSortOrder("0");
      setActive(true);
    }

    setError(null);
  }, [open, category]);

  if (!open) return null;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Kategori adı zorunludur.");
      return;
    }

    const order = Number(sortOrder);

    if (Number.isNaN(order)) {
      setError("Geçerli bir sıralama değeri girin.");
      return;
    }

    const input: MenuCategoryInput = {
      name: name.trim(),
      description: description.trim(),
      sortOrder: order,
      active,
    };

    try {
      setSaving(true);
      setError(null);

      if (category) {
        await updateMenuCategory(category.id, input);
      } else {
        await createMenuCategory(input);
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kategori kaydedilemedi."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!category) return;

    const confirmed = window.confirm(
      `"${category.name}" kategorisini silmek istediğinize emin misiniz?\n\nKategori içerisinde ürün varsa silme işlemi yapılmayacaktır.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteMenuCategory(category.id);

      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kategori silinemedi."
      );
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
              QR Menü
            </p>

            <h2 className="mt-1 text-xl font-black text-[#082d4e]">
              {editing
                ? "Kategoriyi Düzenle"
                : "Yeni Kategori"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <Field label="Kategori Adı">
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Örn. Tatlılar"
                className={inputClass}
              />
            </Field>

            <Field label="Açıklama">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Kategori açıklaması"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Menü Sırası">
              <input
                type="number"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                className={inputClass}
              />

              <p className="mt-2 text-[11px] text-slate-400">
                Küçük sayıdaki kategoriler menüde daha önce görünür.
              </p>
            </Field>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-black text-[#082d4e]">
                  Aktif
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Kategoriyi QR menüde göster
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setActive(!active)}
                className={`relative h-7 w-12 rounded-full transition ${
                  active
                    ? "bg-orange-500"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    active
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-white px-6 py-4">
            {editing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={17} />
                )}

                Kategoriyi Sil
              </button>
            )}

            <div className="ml-auto flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {saving && (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                )}

                {editing
                  ? "Değişiklikleri Kaydet"
                  : "Kategoriyi Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-600">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#082d4e] outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
