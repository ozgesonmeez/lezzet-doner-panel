"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  loginRequest,
  type AuthUser,
} from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<AuthUser>;

  logout: () => void;
};

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

function isTokenExpired(
  token: string
) {
  try {
    const parts =
      token.split(".");

    if (parts.length !== 3) {
      return true;
    }

    let payload =
      parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    payload =
      payload.padEnd(
        Math.ceil(
          payload.length / 4
        ) * 4,
        "="
      );

    const parsed =
      JSON.parse(
        atob(payload)
      ) as {
        exp?: number;
      };

    if (!parsed.exp) {
      return true;
    }

    return (
      Date.now() >=
      parsed.exp * 1000
    );
  } catch {
    return true;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(
      null
    );

  const [token, setToken] =
    useState<string | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const logout =
    useCallback(() => {
      void fetch(
        "/api/bff/api/auth/logout",
        {
          method:
            "POST",

          credentials:
            "same-origin",

          keepalive:
            true,
        }
      ).catch(() => {
        // Logout isteği başarısız olsa bile
        // tarayıcıdaki local oturum temizlenir.
      });

      localStorage.removeItem(
        AUTH_TOKEN_KEY
      );

      localStorage.removeItem(
        AUTH_USER_KEY
      );

      setUser(null);
      setToken(null);
    }, []);

  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem(
          AUTH_TOKEN_KEY
        );

      const storedUser =
        localStorage.getItem(
          AUTH_USER_KEY
        );

      if (
        !storedToken ||
        !storedUser ||
        isTokenExpired(
          storedToken
        )
      ) {
        localStorage.removeItem(
          AUTH_TOKEN_KEY
        );

        localStorage.removeItem(
          AUTH_USER_KEY
        );

        setLoading(false);

        return;
      }

      const parsedUser =
        JSON.parse(
          storedUser
        ) as AuthUser;

      setToken(
        storedToken
      );

      setUser(
        parsedUser
      );
    } catch {
      localStorage.removeItem(
        AUTH_TOKEN_KEY
      );

      localStorage.removeItem(
        AUTH_USER_KEY
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function handleInvalidAuth() {
      setUser(null);
      setToken(null);
    }

    window.addEventListener(
      "lezzet-auth-invalid",
      handleInvalidAuth
    );

    return () => {
      window.removeEventListener(
        "lezzet-auth-invalid",
        handleInvalidAuth
      );
    };
  }, []);

  const login =
    useCallback(
      async (
        email: string,
        password: string
      ) => {
        const result =
          await loginRequest(
            email,
            password
          );

        localStorage.setItem(
          AUTH_TOKEN_KEY,
          result.token
        );

        localStorage.setItem(
          AUTH_USER_KEY,
          JSON.stringify(
            result.user
          )
        );

        setToken(
          result.token
        );

        setUser(
          result.user
        );

        return result.user;
      },
      []
    );

  const value =
    useMemo(
      () => ({
        user,
        token,
        loading,
        login,
        logout,
      }),
      [
        user,
        token,
        loading,
        login,
        logout,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth AuthProvider içinde kullanılmalıdır."
    );
  }

  return context;
}