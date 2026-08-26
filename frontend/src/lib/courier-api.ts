const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/api/bff";

export type CourierEntryType =
  | "NORMAL"
  | "ONLINE";

export type CourierEntry = {
  id: number;
  amount: number;
  entryDate: string;
  entryType: CourierEntryType;
  createdAt: string;
  createdByUserId: number | null;
  createdByName: string | null;
  createdByRole:
    | "ADMIN"
    | "PAKETCI"
    | null;
};

export type Courier = {
  id: number;
  name: string;
  active: boolean;
  packageCount: number;
  totalAmount: number;
  entries: CourierEntry[];
};

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text =
    await response.text();

  let data:
    | Record<string, unknown>
    | null = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : typeof data?.message ===
            "string"
          ? data.message
          : typeof data?.error ===
              "string"
            ? data.error
            : "İşlem gerçekleştirilemedi.";

    throw new Error(message);
  }

  return data as T;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...options.headers,
      },
    }
  );

  return handleResponse<T>(
    response
  );
}

export async function getTodayCouriers(): Promise<
  Courier[]
> {
  return request<Courier[]>(
    "/api/couriers/today",
    {
      method: "GET",
    }
  );
}

export async function getCouriersForDate(
  date: string
): Promise<Courier[]> {
  return request<Courier[]>(
    `/api/couriers?date=${encodeURIComponent(
      date
    )}`,
    {
      method: "GET",
    }
  );
}

export async function createCourier(
  name: string
): Promise<Courier> {
  return request<Courier>(
    "/api/couriers",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    }
  );
}

export async function updateCourierStatus(
  courierId: number,
  active: boolean
): Promise<Courier> {
  return request<Courier>(
    `/api/couriers/${courierId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        active,
      }),
    }
  );
}

export async function deleteCourier(
  courierId: number
): Promise<void> {
  return request<void>(
    `/api/couriers/${courierId}`,
    {
      method: "DELETE",
    }
  );
}

export async function createCourierEntry(
  courierId: number,
  amount: number,
  entryDate: string,
  entryType: CourierEntryType
): Promise<Courier> {
  return request<Courier>(
    `/api/couriers/${courierId}/entries`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        amount,
        entryDate,
        entryType,
      }),
    }
  );
}

export async function updateCourierEntry(
  entryId: number,
  amount: number
): Promise<void> {
  return request<void>(
    `/api/courier-entries/${entryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        amount,
      }),
    }
  );
}

export async function deleteCourierEntry(
  entryId: number
): Promise<void> {
  return request<void>(
    `/api/courier-entries/${entryId}`,
    {
      method: "DELETE",
    }
  );
}