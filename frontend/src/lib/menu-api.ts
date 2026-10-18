import { AUTH_TOKEN_KEY } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type MenuVariant = {
  id: number;
  name: string;
  price: number;
  sortOrder: number;
  active: boolean;
};

export type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

export type MenuProduct = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number | null;
  sortOrder: number;
  active: boolean;
  soldOut: boolean;
  featured: boolean;
  newProduct: boolean;
  variants: MenuVariant[];
};

export type MenuCategoryInput = {
  name: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
};

export type MenuVariantInput = {
  name: string;
  price: number;
  sortOrder?: number;
  active?: boolean;
};

export type MenuProductInput = {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string | null;
  basePrice?: number | null;
  sortOrder?: number;
  active?: boolean;
  soldOut?: boolean;
  featured?: boolean;
  newProduct?: boolean;
  variants?: MenuVariantInput[];
};

async function menuFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "İşlem sırasında bir hata oluştu.";

    try {
      const data = await response.json();

      message =
        data.message ||
        data.error ||
        message;
    } catch {
      // JSON olmayan hata cevabı.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/* =========================
   CATEGORIES
========================= */

export function getMenuCategories() {
  return menuFetch<MenuCategory[]>(
    "/api/menu/categories"
  );
}

export function createMenuCategory(
  input: MenuCategoryInput
) {
  return menuFetch<MenuCategory>(
    "/api/menu/categories",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function updateMenuCategory(
  id: number,
  input: MenuCategoryInput
) {
  return menuFetch<MenuCategory>(
    `/api/menu/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export function deleteMenuCategory(
  id: number
) {
  return menuFetch<void>(
    `/api/menu/categories/${id}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================
   PRODUCTS
========================= */

export function getMenuProducts(
  categoryId?: number
) {
  const query =
    categoryId !== undefined
      ? `?categoryId=${categoryId}`
      : "";

  return menuFetch<MenuProduct[]>(
    `/api/menu/products${query}`
  );
}

export function createMenuProduct(
  input: MenuProductInput
) {
  return menuFetch<MenuProduct>(
    "/api/menu/products",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function updateMenuProduct(
  id: number,
  input: MenuProductInput
) {
  return menuFetch<MenuProduct>(
    `/api/menu/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export function deleteMenuProduct(
  id: number
) {
  return menuFetch<void>(
    `/api/menu/products/${id}`,
    {
      method: "DELETE",
    }
  );
}

export type MenuImageUploadResponse = {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
};

export async function uploadMenuImage(
  file: File
): Promise<MenuImageUploadResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(AUTH_TOKEN_KEY)
      : null;

  if (!token) {
    throw new Error("Oturum bulunamadı.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/menu/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Fotoğraf yüklenemedi.";

    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      // Response JSON değilse varsayılan mesajı kullan.
    }

    throw new Error(message);
  }

  return response.json();
}

/* =========================
   SLIDER MANAGEMENT
========================= */

export type MenuSlide = {
  id: number;
  title: string | null;
  description: string | null;
  desktopImageUrl: string;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  sortOrder: number;
  active: boolean;
};

export type MenuSlideInput = {
  title?: string | null;
  description?: string | null;
  desktopImageUrl: string;
  mobileImageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
};

export function getMenuSlides() {
  return menuFetch<MenuSlide[]>("/api/menu/slides");
}

export function createMenuSlide(input: MenuSlideInput) {
  return menuFetch<MenuSlide>("/api/menu/slides", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMenuSlide(id: number, input: MenuSlideInput) {
  return menuFetch<MenuSlide>(`/api/menu/slides/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteMenuSlide(id: number) {
  return menuFetch<void>(`/api/menu/slides/${id}`, {
    method: "DELETE",
  });
}

export async function getPublicMenuSlides(): Promise<MenuSlide[]> {
  const response = await fetch(
    `${API_URL}/api/public/menu/slides`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Slider görselleri yüklenemedi.");
  }

  return response.json();
}
