const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/api/bff";

export type CreditTransactionType =
  | "CREDIT"
  | "PAYMENT";

export type CreditTransaction = {
  id: number;
  type: CreditTransactionType;
  amount: number;
  transactionDate: string;
  note: string | null;
  createdByUserId: number | null;
  createdByName: string | null;
  createdAt: string;
};

export type CreditCustomerSummary = {
  id: number;
  customerName: string;
  phone: string | null;
  note: string | null;
  balance: number;
  lastTransactionDate: string | null;
  transactionCount: number;
};

export type CreditCustomerList = {
  totalOpenAmount: number;
  customerCount: number;
  debtorCount: number;
  customers: CreditCustomerSummary[];
};

export type CreditCustomerDetail = {
  id: number;
  customerName: string;
  phone: string | null;
  note: string | null;
  balance: number;
  createdByUserId: number | null;
  createdByName: string | null;
  createdAt: string;
  transactions: CreditTransaction[];
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

async function handleResponse<T>(
  response: Response
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

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers =
    new Headers(
      options?.headers
    );

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
        credentials: "include",
        cache: "no-store",
      }
    );

  return handleResponse<T>(
    response
  );
}

export async function getCreditCustomers(): Promise<CreditCustomerList> {
  return request<CreditCustomerList>(
    "/api/credits/customers"
  );
}

export async function getCreditCustomer(
  customerId: number
): Promise<CreditCustomerDetail> {
  return request<CreditCustomerDetail>(
    `/api/credits/customers/${customerId}`
  );
}

export async function createCreditCustomer(
  customerName: string,
  phone: string,
  note: string
): Promise<CreditCustomerDetail> {
  return request<CreditCustomerDetail>(
    "/api/credits/customers",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        customerName,
        phone:
          phone.trim() ||
          null,
        note:
          note.trim() ||
          null,
      }),
    }
  );
}

export async function createCreditTransaction(
  customerId: number,
  type: CreditTransactionType,
  amount: number,
  transactionDate: string,
  note: string
): Promise<CreditTransaction> {
  return request<CreditTransaction>(
    `/api/credits/customers/${customerId}/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        type,
        amount,
        transactionDate,
        note:
          note.trim() ||
          null,
      }),
    }
  );
}