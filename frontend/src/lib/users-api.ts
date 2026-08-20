import {
  AUTH_TOKEN_KEY,
} from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export type UserRole =
  | "ADMIN"
  | "PAKETCI";

export type ManagedUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function getToken() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    AUTH_TOKEN_KEY
  );
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {

  const headers =
    new Headers(
      options?.headers
    );

  const token =
    getToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
      }
    );

  if (!response.ok) {
    let message =
      "Bir hata oluştu.";

    try {
      const data =
        (await response.json()) as ApiErrorResponse;

      message =
        data.message ||
        data.error ||
        message;
    } catch {
      // JSON olmayan hata.
    }

    throw new Error(message);
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getUsers() {
  return request<ManagedUser[]>(
    "/api/users"
  );
}

export async function createUser(
  fullName: string,
  email: string,
  password: string,
  role: UserRole
) {
  return request<ManagedUser>(
    "/api/users",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        role,
      }),
    }
  );
}

export async function updateUser(
  userId: number,
  fullName: string,
  email: string,
  role: UserRole,
  active: boolean
) {
  return request<ManagedUser>(
    `/api/users/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        role,
        active,
      }),
    }
  );
}

export async function resetUserPassword(
  userId: number,
  password: string
) {
  return request<void>(
    `/api/users/${userId}/password`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    }
  );
}