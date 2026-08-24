const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const AUTH_TOKEN_KEY =
  "lezzet_auth_token";

export const AUTH_USER_KEY =
  "lezzet_auth_user";

/* =========================================================
   COMMON
========================================================= */

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    AUTH_TOKEN_KEY
  );

  localStorage.removeItem(
    AUTH_USER_KEY
  );

  window.dispatchEvent(
    new Event(
      "lezzet-auth-invalid"
    )
  );
}

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    AUTH_TOKEN_KEY
  );
}

async function handleResponse<T>(
  response: Response,
  clearOnUnauthorized = true
): Promise<T> {
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
      // JSON olmayan hata cevabı.
    }

    if (
      response.status === 401 &&
      clearOnUnauthorized
    ) {
      clearStoredAuth();
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function authorizedFetch(
  input: string,
  init?: RequestInit
) {
  const headers =
    new Headers(
      init?.headers
    );

  const token =
    getStoredToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

/* =========================================================
   AUTH
========================================================= */

export type AuthUserRole =
  | "ADMIN"
  | "PAKETCI";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: AuthUserRole;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return handleResponse<LoginResponse>(
    response,
    false
  );
}

/* =========================================================
   COURIER
========================================================= */

export type CourierEntry = {
  id: number;
  amount: number;
  entryDate: string;
  createdAt: string;

  createdByUserId:
    | number
    | null;

  createdByName:
    | string
    | null;

  createdByRole:
    | AuthUserRole
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

export async function getTodayCouriers(): Promise<
  Courier[]
> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/couriers/today`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

  return handleResponse<Courier[]>(
    response
  );
}

export async function createCourier(
  name: string
): Promise<Courier> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/couriers`,
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

  return handleResponse<Courier>(
    response
  );
}

export async function updateCourierStatus(
  courierId: number,
  active: boolean
): Promise<Courier> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/couriers/${courierId}/status`,
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

  return handleResponse<Courier>(
    response
  );
}

export async function deleteCourier(
  courierId: number
): Promise<void> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/couriers/${courierId}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse<void>(
    response
  );
}

export async function createCourierEntry(
  courierId: number,
  amount: number
): Promise<Courier> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/couriers/${courierId}/entries`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      }
    );

  return handleResponse<Courier>(
    response
  );
}

export async function updateCourierEntry(
  entryId: number,
  amount: number
): Promise<void> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/courier-entries/${entryId}`,
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

  return handleResponse<void>(
    response
  );
}

export async function deleteCourierEntry(
  entryId: number
): Promise<void> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/courier-entries/${entryId}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse<void>(
    response
  );
}

/* =========================================================
   DAILY CASH
========================================================= */

export type DailyIncome = {
  id: number;
  channel: string;
  amount: number;
  entryDate: string;
  createdAt: string;
};

export type DailyExpense = {
  id: number;
  description: string;
  amount: number;
  entryDate: string;
  createdAt: string;
};

export type DailyCash = {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  incomes: DailyIncome[];
  expenses: DailyExpense[];
};

export async function getDailyCash(
  date?: string
): Promise<DailyCash> {
  const query = date
    ? `?date=${encodeURIComponent(
        date
      )}`
    : "";

  const response =
    await authorizedFetch(
      `${API_URL}/api/daily-cash${query}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

  return handleResponse<DailyCash>(
    response
  );
}

export async function createDailyIncome(
  channel: string,
  amount: number,
  entryDate?: string
): Promise<DailyIncome> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/daily-cash/incomes`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          channel,
          amount,
          entryDate,
        }),
      }
    );

  return handleResponse<DailyIncome>(
    response
  );
}

export async function updateDailyIncome(
  incomeId: number,
  channel: string,
  amount: number
): Promise<DailyIncome> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/daily-cash/incomes/${incomeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          channel,
          amount,
        }),
      }
    );

  return handleResponse<DailyIncome>(
    response
  );
}

export async function deleteDailyIncome(
  incomeId: number
): Promise<void> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/daily-cash/incomes/${incomeId}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse<void>(
    response
  );
}

export async function createDailyExpense(
  description: string,
  amount: number,
  entryDate?: string
): Promise<DailyExpense> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/daily-cash/expenses`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          description,
          amount,
          entryDate,
        }),
      }
    );

  return handleResponse<DailyExpense>(
    response
  );
}

export async function updateDailyExpense(
  expenseId: number,
  description: string,
  amount: number
): Promise<DailyExpense> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/daily-cash/expenses/${expenseId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          description,
          amount,
        }),
      }
    );

  return handleResponse<DailyExpense>(
    response
  );
}

export async function deleteDailyExpense(
  expenseId: number
): Promise<void> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/daily-cash/expenses/${expenseId}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse<void>(
    response
  );
}

/* =========================================================
   MONTHLY SUMMARY
========================================================= */

export type MonthlyDaySummary = {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
};

export type MonthlyExtraExpense = {
  id: number;
  description: string;
  amount: number;
  createdAt: string;
};

export type MonthlySummary = {
  month: string;
  totalIncome: number;
  dailyExpenseTotal: number;
  extraExpenseTotal: number;
  totalExpense: number;
  netAmount: number;
  days: MonthlyDaySummary[];
  extraExpenses: MonthlyExtraExpense[];
};

export async function getMonthlySummary(
  month: string
): Promise<MonthlySummary> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/monthly-summary?month=${encodeURIComponent(
        month
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

  return handleResponse<MonthlySummary>(
    response
  );
}

export async function createMonthlyExtraExpense(
  month: string,
  description: string,
  amount: number
): Promise<MonthlyExtraExpense> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/monthly-summary/extra-expenses?month=${encodeURIComponent(
        month
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          description,
          amount,
        }),
      }
    );

  return handleResponse<MonthlyExtraExpense>(
    response
  );
}

export async function updateMonthlyExtraExpense(
  expenseId: number,
  description: string,
  amount: number
): Promise<MonthlyExtraExpense> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/monthly-summary/extra-expenses/${expenseId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          description,
          amount,
        }),
      }
    );

  return handleResponse<MonthlyExtraExpense>(
    response
  );
}

export async function deleteMonthlyExtraExpense(
  expenseId: number
): Promise<void> {
  const response =
    await authorizedFetch(
      `${API_URL}/api/monthly-summary/extra-expenses/${expenseId}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse<void>(
    response
  );
}

/* =========================================================
   REPORTS
========================================================= */

export type SalesChannelReport = {
  channel: string;
  totalAmount: number;
};

export type CourierReport = {
  courierId: number;
  courierName: string;
  packageCount: number;
  totalAmount: number;
};

export type StaffReport = {
  userId: number | null;
  fullName: string;
  role: AuthUserRole | null;
  packageCount: number;
  totalAmount: number;
};

export type DailyReport = {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  packageCount: number;
  packageAmount: number;
};

export type ReportExtraExpense = {
  id: number;
  expenseMonth: string;
  description: string;
  amount: number;
};

export type Report = {
  startDate: string;
  endDate: string;

  totalIncome: number;
  dailyExpenseTotal: number;
  extraExpenseTotal: number;
  totalExpense: number;
  netAmount: number;

  totalPackageCount: number;
  totalPackageAmount: number;

  salesChannels: SalesChannelReport[];
  couriers: CourierReport[];
  staff: StaffReport[];
  days: DailyReport[];
  extraExpenses: ReportExtraExpense[];
};

export async function getReport(
  startDate: string,
  endDate: string
): Promise<Report> {
  const params =
    new URLSearchParams({
      startDate,
      endDate,
    });

  const response =
    await authorizedFetch(
      `${API_URL}/api/reports?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

  return handleResponse<Report>(
    response
  );
}