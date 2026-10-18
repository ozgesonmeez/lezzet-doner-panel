"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  LoaderCircle,
  PackageOpen,
  Plus,
  QrCode,
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import ProductModal from "@/components/qr-menu/ProductModal";
import SliderManager from "@/components/qr-menu/SliderManager";
import CategoryModal from "@/components/qr-menu/CategoryModal";

import {
  getMenuCategories,
  getMenuProducts,
  type MenuCategory,
  type MenuProduct,
} from "@/lib/menu-api";

export default function QrMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productModalOpen, setProductModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<MenuProduct | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<MenuCategory | null>(null);

  const loadMenu = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [categoryData, productData] = await Promise.all([
        getMenuCategories(),
        getMenuProducts(),
      ]);

      setCategories(categoryData);
      setProducts(productData);

      setSelectedCategoryId((current) => {
        if (
          current !== null &&
          categoryData.some((category) => category.id === current)
        ) {
          return current;
        }

        return categoryData[0]?.id ?? null;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "QR Menü verileri yüklenemedi."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category.id === selectedCategoryId
      ) ?? null,
    [categories, selectedCategoryId]
  );

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) => product.categoryId === selectedCategoryId
      ),
    [products, selectedCategoryId]
  );

  const activeProducts = products.filter(
    (product) => product.active
  ).length;

  const soldOutProducts = products.filter(
    (product) => product.soldOut
  ).length;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-[28px] bg-[#082d4e] text-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 sm:p-8">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-950/20">
                  <QrCode size={23} />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                  Dijital Menü Yönetimi
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  QR Menü
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Müşterilerin QR kod ile göreceği menüyü,
                  kategorileri ve ürün durumlarını buradan yönetin.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void loadMenu(true)}
                  disabled={refreshing}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15 disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Yenile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600"
                >
                  <Plus size={18} />
                  Yeni Ürün
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={19} />
            {error}
          </div>
        )}

        <SliderManager />

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Kategori"
            value={categories.length}
            icon={<UtensilsCrossed size={20} />}
          />

          <StatCard
            label="Aktif Ürün"
            value={activeProducts}
            icon={<CheckCircle2 size={20} />}
          />

          <StatCard
            label="Tükendi"
            value={soldOutProducts}
            icon={<CircleOff size={20} />}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between px-2 pb-4">
              <div>
                <h2 className="font-black text-[#082d4e]">
                  Kategoriler
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {categories.length} kategori
                </p>
              </div>

              <button
                type="button"
                aria-label="Yeni kategori"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {categories.map((category) => {
                const selected =
                  category.id === selectedCategoryId;

                const count = products.filter(
                  (product) => product.categoryId === category.id
                ).length;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryId(category.id)
                    }
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                      selected
                        ? "bg-[#082d4e] text-white shadow-lg shadow-slate-200"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {category.name}
                      </p>

                      <p
                        className={`mt-1 text-[11px] ${
                          selected
                            ? "text-slate-300"
                            : "text-slate-400"
                        }`}
                      >
                        {count} ürün
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className={
                        selected
                          ? "text-orange-400"
                          : "text-slate-400"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                  Ürünler
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#082d4e]">
                  {selectedCategory?.name ?? "Kategori seçin"}
                </h2>

                {selectedCategory?.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedCategory.description}
                  </p>
                )}

                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(selectedCategory);
                      setCategoryModalOpen(true);
                    }}
                    className="mt-3 inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-[#082d4e] transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Kategoriyi Düzenle
                  </button>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-400">
                {visibleProducts.length} ürün
              </p>
            </div>

            {visibleProducts.length === 0 ? (
              <EmptyProducts />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => {
                      setEditingProduct(product);
                      setProductModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <ProductModal
        open={productModalOpen}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        product={editingProduct}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={async () => {
          await loadMenu(true);
        }}
      />

      <CategoryModal
        open={categoryModalOpen}
        category={editingCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSaved={async () => {
          await loadMenu(true);
        }}
      />
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        {icon}
      </div>

      <div>
        <p className="text-2xl font-black text-[#082d4e]">
          {value}
        </p>
        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onEdit,
}: {
  product: MenuProduct;
  onEdit: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-center text-slate-300">
            <PackageOpen
              size={34}
              className="mx-auto"
            />
            <p className="mt-2 text-xs font-semibold">
              Görsel eklenmedi
            </p>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.featured && (
            <Badge>
              <Sparkles size={12} />
              Öne Çıkan
            </Badge>
          )}

          {product.newProduct && (
            <Badge>Yeni</Badge>
          )}

          {product.soldOut && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              Tükendi
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[#082d4e]">
              {product.name}
            </h3>

            <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
              {product.description || "Açıklama eklenmedi."}
            </p>
          </div>

          <span
            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
              product.active
                ? "bg-emerald-500"
                : "bg-slate-300"
            }`}
            title={product.active ? "Aktif" : "Pasif"}
          />
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          {product.basePrice !== null ? (
            <p className="text-xl font-black text-orange-600">
              {formatPrice(product.basePrice)}
            </p>
          ) : product.variants.length > 0 ? (
            <p className="text-sm font-bold text-orange-600">
              {product.variants.length} fiyat seçeneği
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-400">
              Fiyat belirtilmedi
            </p>
          )}
        </div>

        {product.variants.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <span
                key={variant.id}
                className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600"
              >
                {variant.name} · {formatPrice(variant.price)}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onEdit}
          className="mt-4 min-h-10 w-full rounded-xl border border-slate-200 text-xs font-bold text-[#082d4e] transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
        >
          Ürünü Düzenle
        </button>
      </div>
    </article>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#082d4e] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

function EmptyProducts() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <PackageOpen size={26} />
        </div>

        <h3 className="mt-4 font-black text-[#082d4e]">
          Bu kategoride henüz ürün yok
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Yeni ürün eklediğinizde burada görüntülenecek.
        </p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f8fa]">
      <div className="text-center">
        <LoaderCircle
          size={34}
          className="mx-auto animate-spin text-orange-500"
        />
        <p className="mt-3 text-sm font-semibold text-slate-500">
          QR Menü yükleniyor...
        </p>
      </div>
    </main>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
