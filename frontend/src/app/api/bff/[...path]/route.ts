import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE_NAME =
  "lezzet_session";

const DEFAULT_SESSION_SECONDS =
  8 * 60 * 60;

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

type BackendLoginResponse = {
  token?: string;
  user?: unknown;
};

function getBackendApiUrl() {
  const value =
    process.env.BACKEND_API_URL?.trim();

  if (!value) {
    throw new Error(
      "BACKEND_API_URL tanımlı değil."
    );
  }

  return value.replace(
    /\/+$/,
    ""
  );
}

function isUnsafeMethod(
  method: string
) {
  return ![
    "GET",
    "HEAD",
    "OPTIONS",
  ].includes(
    method.toUpperCase()
  );
}

function isSameOrigin(
  request: NextRequest
) {
  const origin =
    request.headers.get(
      "origin"
    );

  if (!origin) {
    return true;
  }

  try {
    const originUrl =
      new URL(origin);

    const forwardedHost =
      request.headers.get(
        "x-forwarded-host"
      );

    const requestHost =
      forwardedHost ||
      request.headers.get(
        "host"
      );

    if (!requestHost) {
      return false;
    }

    const forwardedProto =
      request.headers.get(
        "x-forwarded-proto"
      );

    const requestProtocol =
      forwardedProto
        ? `${forwardedProto}:`
        : request.nextUrl.protocol;

    return (
      originUrl.host ===
        requestHost &&
      originUrl.protocol ===
        requestProtocol
    );
  } catch {
    return false;
  }
}

function jsonError(
  status: number,
  message: string
) {
  return NextResponse.json(
    {
      status,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

function readJwtExpiration(
  token: string
) {
  try {
    const parts =
      token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload =
      JSON.parse(
        Buffer.from(
          parts[1],
          "base64url"
        ).toString(
          "utf8"
        )
      ) as {
        exp?: number;
      };

    if (
      typeof payload.exp !==
      "number"
    ) {
      return null;
    }

    return payload.exp;
  } catch {
    return null;
  }
}

function getSessionMaxAge(
  token: string
) {
  const exp =
    readJwtExpiration(
      token
    );

  if (!exp) {
    return DEFAULT_SESSION_SECONDS;
  }

  const remaining =
    exp -
    Math.floor(
      Date.now() / 1000
    );

  return Math.max(
    1,
    remaining
  );
}

function createClientSessionMarker(
  token: string
) {
  const exp =
    readJwtExpiration(
      token
    ) ??
    Math.floor(
      Date.now() / 1000
    ) +
      DEFAULT_SESSION_SECONDS;

  const header =
    Buffer.from(
      JSON.stringify({
        alg: "none",
        typ: "SESSION",
      })
    ).toString(
      "base64url"
    );

  const payload =
    Buffer.from(
      JSON.stringify({
        exp,
      })
    ).toString(
      "base64url"
    );

  return `${header}.${payload}.client-session`;
}

function setSessionCookie(
  response: NextResponse,
  token: string
) {
  response.cookies.set({
    name:
      SESSION_COOKIE_NAME,

    value:
      token,

    httpOnly:
      true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      "lax",

    path:
      "/",

    maxAge:
      getSessionMaxAge(
        token
      ),
  });
}

function clearSessionCookie(
  response: NextResponse
) {
  response.cookies.set({
    name:
      SESSION_COOKIE_NAME,

    value:
      "",

    httpOnly:
      true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      "lax",

    path:
      "/",

    maxAge:
      0,
  });
}

async function handleLogin(
  request: NextRequest
) {
  if (
    request.method !== "POST"
  ) {
    return jsonError(
      405,
      "Bu işlem desteklenmiyor."
    );
  }

  if (
    !isSameOrigin(
      request
    )
  ) {
    return jsonError(
      403,
      "İstek kaynağına izin verilmiyor."
    );
  }

  const backendUrl =
    `${getBackendApiUrl()}/api/auth/login`;

  const body =
    await request.arrayBuffer();

  const backendResponse =
    await fetch(
      backendUrl,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            request.headers.get(
              "content-type"
            ) ??
            "application/json",

          Accept:
            "application/json",
        },

        body,

        cache:
          "no-store",

        redirect:
          "manual",
      }
    );

  const rawBody =
    await backendResponse.text();

  if (
    !backendResponse.ok
  ) {
    return new NextResponse(
      rawBody || null,
      {
        status:
          backendResponse.status,

        headers: {
          "Content-Type":
            backendResponse.headers.get(
              "content-type"
            ) ??
            "application/json",

          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  let data:
    BackendLoginResponse;

  try {
    data =
      JSON.parse(
        rawBody
      ) as BackendLoginResponse;
  } catch {
    return jsonError(
      502,
      "Sunucudan geçersiz giriş cevabı alındı."
    );
  }

  if (
    !data.token ||
    !data.user
  ) {
    return jsonError(
      502,
      "Giriş cevabı eksik."
    );
  }

  const response =
    NextResponse.json(
      {
        token:
          createClientSessionMarker(
            data.token
          ),

        user:
          data.user,
      },
      {
        status:
          200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );

  setSessionCookie(
    response,
    data.token
  );

  return response;
}

function handleLogout(
  request: NextRequest
) {
  if (
    request.method !== "POST"
  ) {
    return jsonError(
      405,
      "Bu işlem desteklenmiyor."
    );
  }

  if (
    !isSameOrigin(
      request
    )
  ) {
    return jsonError(
      403,
      "İstek kaynağına izin verilmiyor."
    );
  }

  const response =
    new NextResponse(
      null,
      {
        status:
          204,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );

  clearSessionCookie(
    response
  );

  return response;
}

async function proxyToBackend(
  request: NextRequest,
  path: string[]
) {
  if (
    isUnsafeMethod(
      request.method
    ) &&
    !isSameOrigin(
      request
    )
  ) {
    return jsonError(
      403,
      "İstek kaynağına izin verilmiyor."
    );
  }

  if (
    path.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".."
    )
  ) {
    return jsonError(
      400,
      "Geçersiz API yolu."
    );
  }

  const relativePath =
    path.join("/");

  if (
    !relativePath.startsWith(
      "api/"
    )
  ) {
    return jsonError(
      404,
      "API yolu bulunamadı."
    );
  }

  const backendUrl =
    `${getBackendApiUrl()}/${relativePath}${request.nextUrl.search}`;

  const headers =
    new Headers();

  const contentType =
    request.headers.get(
      "content-type"
    );

  const accept =
    request.headers.get(
      "accept"
    );

  if (contentType) {
    headers.set(
      "Content-Type",
      contentType
    );
  }

  if (accept) {
    headers.set(
      "Accept",
      accept
    );
  }

  const token =
    request.cookies.get(
      SESSION_COOKIE_NAME
    )?.value;

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const options:
    RequestInit = {
      method:
        request.method,

      headers,

      cache:
        "no-store",

      redirect:
        "manual",
    };

  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    const body =
      await request.arrayBuffer();

    if (
      body.byteLength > 0
    ) {
      options.body =
        body;
    }
  }

  const backendResponse =
    await fetch(
      backendUrl,
      options
    );

  const responseHeaders =
    new Headers();

  const responseContentType =
    backendResponse.headers.get(
      "content-type"
    );

  const contentDisposition =
    backendResponse.headers.get(
      "content-disposition"
    );

  if (
    responseContentType
  ) {
    responseHeaders.set(
      "Content-Type",
      responseContentType
    );
  }

  if (
    contentDisposition
  ) {
    responseHeaders.set(
      "Content-Disposition",
      contentDisposition
    );
  }

  responseHeaders.set(
    "Cache-Control",
    "no-store"
  );

  const responseBody =
    request.method ===
      "HEAD" ||
    backendResponse.status ===
      204
      ? null
      : await backendResponse.arrayBuffer();

  const response =
    new NextResponse(
      responseBody,
      {
        status:
          backendResponse.status,

        headers:
          responseHeaders,
      }
    );

  if (
    backendResponse.status ===
    401
  ) {
    clearSessionCookie(
      response
    );
  }

  return response;
}

async function handler(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const {
      path,
    } =
      await context.params;

    const relativePath =
      path.join("/");

    if (
      relativePath ===
      "api/auth/login"
    ) {
      return handleLogin(
        request
      );
    }

    if (
      relativePath ===
      "api/auth/logout"
    ) {
      return handleLogout(
        request
      );
    }

    return proxyToBackend(
      request,
      path
    );
  } catch (error) {
    console.error(
      "BFF request error:",
      error
    );

    return jsonError(
      502,
      "Backend servisine ulaşılamadı."
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  return handler(
    request,
    context
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  return handler(
    request,
    context
  );
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return handler(
    request,
    context
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  return handler(
    request,
    context
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return handler(
    request,
    context
  );
}

export async function HEAD(
  request: NextRequest,
  context: RouteContext
) {
  return handler(
    request,
    context
  );
}

export async function OPTIONS(
  request: NextRequest,
  context: RouteContext
) {
  return handler(
    request,
    context
  );
}