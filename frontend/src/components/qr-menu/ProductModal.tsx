"use client";

import { useEffect, useState } from "react";
import {
  ImagePlus,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createMenuProduct,
  updateMenuProduct,
  uploadMenuImage,
  type MenuCategory,
  type MenuProduct,
  type MenuProductInput,
  type MenuVariantInput,
} from "@/lib/menu-api";

type ProductModalProps = {
  open: boolean;
  categories: MenuCategory[];
  selectedCategoryId: number | null;
  product?: MenuProduct | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

type VariantForm = {
  name: string;
  price: string;
};

export default function ProductModal({
  open,
  categories,
  selectedCategoryId,
  product,
  onClose,
  onSaved,
}: ProductModalProps) {
  const editing = Boolean(product);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [menuOrder, setMenuOrder] = useState(String(product?.sortOrder ?? 0));
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [active, setActive] = useState(true);
  const [soldOut, setSoldOut] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [newProduct, setNewProduct] = useState(false);

  const [useVariants, setUseVariants] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (product) {
      setCategoryId(String(product.categoryId));
      setName(product.name);
      setMenuOrder(String(product.sortOrder ?? 0));
      setDescription(product.description ?? "");
      setBasePrice(
        product.basePrice !== null
          ? String(product.basePrice)
          : ""
      );
      setImageUrl(product.imageUrl ?? "");
      setImageFile(null);
      setImagePreview(product.imageUrl ?? "");
      setActive(product.active);
      setSoldOut(product.soldOut);
      setFeatured(product.featured);
      setNewProduct(product.newProduct);

      const hasVariants = product.variants.length > 0;

      setUseVariants(hasVariants);
      setVariants(
        product.variants.map((variant) => ({
          name: variant.name,
          price: String(variant.price),
        }))
      );
    } else {
      setCategoryId(
        selectedCategoryId
          ? String(selectedCategoryId)
          : categories[0]
            ? String(categories[0].id)
            : ""
      );

      setName("");
      setMenuOrder("0");
      setDescription("");
      setBasePrice("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview("");
      setActive(true);
      setSoldOut(false);
      setFeatured(false);
      setNewProduct(false);
      setUseVariants(false);
      setVariants([]);
    }

    setError(null);
  }, [
    open,
    product,
    selectedCategoryId,
    categories,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        name: "",
        price: "",
      },
    ]);
  }

  function updateVariant(
    index: number,
    field: keyof VariantForm,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  function removeVariant(index: number) {
    setVariants((current) =>
      current.filter(
        (_, variantIndex) => variantIndex !== index
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const parsedCategoryId = Number(categoryId);

    if (!parsedCategoryId) {
      setError("Lütfen bir kategori seçin.");
      return;
    }

    if (!name.trim()) {
      setError("Ürün adı zorunludur.");
      return;
    }

    if (!useVariants && !basePrice.trim()) {
      setError("Lütfen ürün fiyatını girin.");
      return;
    }

    if (useVariants && variants.length === 0) {
      setError("En az bir fiyat seçeneği ekleyin.");
      return;
    }

    let variantPayload: MenuVariantInput[] = [];

    if (useVariants) {
      for (let index = 0; index < variants.length; index += 1) {
        const variant = variants[index];
        const price = Number(variant.price);

        if (!variant.name.trim()) {
          setError(
            `${index + 1}. fiyat seçeneğinin adını girin.`
          );
          return;
        }

        if (
          variant.price.trim() === "" ||
          Number.isNaN(price) ||
          price < 0
        ) {
          setError(
            `${variant.name || `${index + 1}. seçenek`} için geçerli bir fiyat girin.`
          );
          return;
        }

        variantPayload.push({
          name: variant.name.trim(),
          price,
          sortOrder: index + 1,
          active: true,
        });
      }
    }

    const price =
      !useVariants && basePrice.trim()
        ? Number(basePrice)
        : null;

    if (
      price !== null &&
      (Number.isNaN(price) || price < 0)
    ) {
      setError("Geçerli bir ürün fiyatı girin.");
      return;
    }

    let finalImageUrl = imageUrl.trim();

    try {
      setSaving(true);
      setError(null);

      if (imageFile) {
        const uploadedImage = await uploadMenuImage(imageFile);
        finalImageUrl = uploadedImage.url;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ürün fotoğrafı yüklenemedi."
      );
      setSaving(false);
      return;
    }

    const input: MenuProductInput = {
      categoryId: parsedCategoryId,
      name: name.trim(),
      description: description.trim(),
      imageUrl: finalImageUrl || null,
      basePrice: useVariants ? null : price,
      sortOrder: Number(menuOrder),
      active,
      soldOut,
      featured,
      newProduct,
      variants: useVariants
        ? variantPayload
        : [],
    };

    try {
      if (product) {
        await updateMenuProduct(product.id, input);
      } else {
        await createMenuProduct(input);
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ürün kaydedilemedi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
      />

      <div className="relative z-10 flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
              QR Menü
            </p>

            <h2 className="mt-1 text-xl font-black text-[#082d4e] sm:text-2xl">
              {editing
                ? "Ürünü Düzenle"
                : "Yeni Ürün"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-6 p-5 sm:p-7">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Kategori">
                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">
                    Kategori seçin
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ürün Adı">
                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Örn. Tam Tavuk Döner"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Menü Sırası">
              <input
                type="number"
                min="0"
                step="1"
                value={menuOrder}
                onChange={(event) => setMenuOrder(event.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                Küçük numaralar önce, büyük numaralar sonra görünür.
              </p>
            </Field>

            <Field label="Açıklama">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Ürün açıklaması"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[#082d4e]">
                    Fiyat seçenekleri
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Gramaj veya boyuta göre farklı fiyatlar kullanabilirsiniz.
                  </p>
                </div>

                <Toggle
                  checked={useVariants}
                  onChange={(checked) => {
                    setUseVariants(checked);

                    if (
                      checked &&
                      variants.length === 0
                    ) {
                      setVariants([
                        {
                          name: "",
                          price: "",
                        },
                      ]);
                    }
                  }}
                />
              </div>

              {!useVariants ? (
                <div className="mt-5">
                  <Field label="Fiyat">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={basePrice}
                        onChange={(event) =>
                          setBasePrice(event.target.value)
                        }
                        placeholder="150"
                        className={`${inputClass} pr-14`}
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                        TL
                      </span>
                    </div>
                  </Field>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_160px_44px]"
                    >
                      <input
                        value={variant.name}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Örn. 100 gr"
                        className={inputClass}
                      />

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "price",
                              event.target.value
                            )
                          }
                          placeholder="200"
                          className={`${inputClass} pr-10`}
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                          TL
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeVariant(index)
                        }
                        className="flex h-11 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
                        aria-label="Fiyat seçeneğini sil"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-dashed border-orange-300 px-4 text-xs font-black text-orange-600 transition hover:bg-orange-50"
                  >
                    <Plus size={16} />
                    Fiyat Seçeneği Ekle
                  </button>
                </div>
              )}
            </div>

            <Field label="Ürün Fotoğrafı">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Ürün fotoğrafı önizleme"
                      className="h-52 w-full object-contain bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImageUrl("");
                        setImagePreview("");
                      }}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md transition hover:bg-red-50"
                      aria-label="Fotoğrafı kaldır"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <ImagePlus size={23} />
                    </div>

                    <p className="mt-3 text-sm font-black text-[#082d4e]">
                      Ürün fotoğrafı ekle
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      JPG, PNG veya WebP · Maksimum 10 MB
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 bg-white p-3">
                  <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082d4e] px-4 text-sm font-black text-white transition hover:bg-[#0b3b66]">
                    <ImagePlus size={17} />

                    {imagePreview
                      ? "Fotoğrafı Değiştir"
                      : "Fotoğraf Seç"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0] ?? null;

                        if (!file) {
                          return;
                        }

                        const allowedTypes = [
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                        ];

                        if (!allowedTypes.includes(file.type)) {
                          setError(
                            "Sadece JPG, PNG veya WebP görsel seçebilirsiniz."
                          );
                          event.target.value = "";
                          return;
                        }

                        if (file.size > 10 * 1024 * 1024) {
                          setError(
                            "Ürün fotoğrafı en fazla 10 MB olabilir."
                          );
                          event.target.value = "";
                          return;
                        }

                        setError(null);
                        setImageFile(file);
                        setImagePreview(
                          URL.createObjectURL(file)
                        );

                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                Seçtiğiniz fotoğraf ürünü kaydettiğinizde güvenli şekilde yüklenecektir.
              </p>
            </Field>

            <div>
              <p className="mb-3 text-sm font-black text-[#082d4e]">
                Ürün Durumu
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <StatusOption
                  title="Aktif"
                  description="QR menüde göster"
                  checked={active}
                  onChange={setActive}
                />

                <StatusOption
                  title="Tükendi"
                  description="Ürünü tükendi olarak göster"
                  checked={soldOut}
                  onChange={setSoldOut}
                />

                <StatusOption
                  title="Öne Çıkan"
                  description="Ürünü vurgula"
                  checked={featured}
                  onChange={setFeatured}
                />

                <StatusOption
                  title="Yeni Ürün"
                  description="Yeni ürün etiketi göster"
                  checked={newProduct}
                  onChange={setNewProduct}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-11 flex-1 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {saving && (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Kaydediliyor..."
                : editing
                  ? "Değişiklikleri Kaydet"
                  : "Ürünü Kaydet"}
            </button>
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

function StatusOption({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-black text-[#082d4e]">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked
          ? "bg-orange-500"
          : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#082d4e] outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
