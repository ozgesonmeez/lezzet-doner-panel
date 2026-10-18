"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  createMenuSlide,
  deleteMenuSlide,
  getMenuSlides,
  updateMenuSlide,
  uploadMenuImage,
  type MenuSlide,
  type MenuSlideInput,
} from "@/lib/menu-api";

const emptyForm: MenuSlideInput = {
  title: "",
  description: "",
  desktopImageUrl: "",
  mobileImageUrl: "",
  buttonText: "",
  buttonUrl: "/menu",
  sortOrder: 0,
  active: true,
};

export default function SliderManager() {
  const [slides, setSlides] = useState<MenuSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<MenuSlideInput>(emptyForm);

  const loadSlides = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSlides(await getMenuSlides());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Slider listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSlides();
  }, [loadSlides]);

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: slides.length });
    setError("");
    setFormOpen(true);
  }

  function openEdit(slide: MenuSlide) {
    setEditingId(slide.id);
    setForm({
      title: slide.title,
      description: slide.description,
      desktopImageUrl: slide.desktopImageUrl,
      mobileImageUrl: slide.mobileImageUrl,
      buttonText: slide.buttonText,
      buttonUrl: slide.buttonUrl,
      sortOrder: slide.sortOrder,
      active: slide.active,
    });
    setError("");
    setFormOpen(true);
  }

  async function handleUpload(
    file: File | undefined,
    target: "desktop" | "mobile"
  ) {
    if (!file) return;

    try {
      setUploading(target);
      setError("");
      const result = await uploadMenuImage(file);
      setForm((current) => ({
        ...current,
        [target === "desktop" ? "desktopImageUrl" : "mobileImageUrl"]:
          result.url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi.");
    } finally {
      setUploading(null);
    }
  }

  async function saveSlide() {
    if (!form.desktopImageUrl?.trim()) {
      setError("Masaüstü görseli zorunludur.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        await updateMenuSlide(editingId, form);
      } else {
        await createMenuSlide(form);
      }

      setFormOpen(false);
      await loadSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Slider kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSlide(slide: MenuSlide) {
    if (!window.confirm("Bu slider kalıcı olarak silinsin mi?")) return;

    try {
      setError("");
      await deleteMenuSlide(slide.id);
      await loadSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Slider silinemedi.");
    }
  }

  async function toggleSlide(slide: MenuSlide) {
    try {
      setError("");
      await updateMenuSlide(slide.id, {
        ...slide,
        active: !slide.active,
      });
      await loadSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum değiştirilemedi.");
    }
  }

  return (
    <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Vitrin Yönetimi
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#082d4e]">
            Slider Yönetimi
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            QR menünün üst bölümündeki kampanya görsellerini yönetin.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadSlides()}
            className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50"
            aria-label="Slider listesini yenile"
          >
            <RefreshCw size={18} />
          </button>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Plus size={18} /> Yeni Slider
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoaderCircle className="animate-spin text-orange-500" />
        </div>
      ) : slides.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          Henüz slider eklenmedi. İlk görselinizi yükleyebilirsiniz.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {slides.map((slide) => (
            <article
              key={slide.id}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >
              <div className="aspect-video bg-slate-100">
                <img
                  src={slide.desktopImageUrl}
                  alt={slide.title || "Slider görseli"}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold text-[#082d4e]">
                    {slide.title || "Başlıksız Slider"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Sıra: {slide.sortOrder} · {slide.active ? "Aktif" : "Pasif"}
                    {slide.mobileImageUrl ? " · Mobil görsel var" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleSlide(slide)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
                  >
                    {slide.active ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(slide)}
                    aria-label="Slider düzenle"
                    className="rounded-lg bg-slate-100 p-2 text-slate-700"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeSlide(slide)}
                    aria-label="Slider sil"
                    className="rounded-lg bg-red-50 p-2 text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId === null ? "Yeni Slider" : "Slider Düzenle"}
            className="my-auto w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <h3 className="text-2xl font-black text-[#082d4e]">
              {editingId === null ? "Yeni Slider" : "Slider Düzenle"}
            </h3>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {(["desktop", "mobile"] as const).map((target) => {
                const url =
                  target === "desktop"
                    ? form.desktopImageUrl
                    : form.mobileImageUrl;

                return (
                  <label key={target} className="block">
                    <span className="text-sm font-bold text-slate-700">
                      {target === "desktop"
                        ? "Masaüstü Görseli *"
                        : "Mobil Görseli"}
                    </span>
                    <div className="mt-2 flex min-h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                      {url ? (
                        <img
                          src={url}
                          alt="Yüklenen görsel önizlemesi"
                          className="max-h-52 w-full object-contain"
                        />
                      ) : (
                        <ImagePlus className="text-slate-400" size={32} />
                      )}
                    </div>
                    <span className="mt-2 block text-xs text-slate-500">
                      {uploading === target
                        ? "Yükleniyor..."
                        : "Görsel seçmek için tıklayın"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading !== null || saving}
                      className="mt-2 block w-full text-xs"
                      onChange={(event) =>
                        void handleUpload(event.target.files?.[0], target)
                      }
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                Yönetim Başlığı
                <input
                  value={form.title ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal"
                  placeholder="Örn. Zurna Dürüm Kampanyası"
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Gösterim Sırası
                <input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: Number(e.target.value) })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal"
                />
              </label>
              <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                Yönlendirme Adresi
                <input
                  value={form.buttonUrl ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, buttonUrl: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal"
                  placeholder="/menu"
                />
              </label>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />
              Slider aktif
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving || uploading !== null}
                onClick={() => setFormOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={saving || uploading !== null}
                onClick={() => void saveSlide()}
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
