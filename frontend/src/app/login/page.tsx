"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

export default function LoginPage() {
  const router =
    useRouter();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState(
      "admin@lezzetdoner.local"
    );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !email.trim() ||
      !password ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const user =
        await login(
          email,
          password
        );

      router.replace(
        user.role ===
          "PAKETCI"
          ? "/kurye-takip"
          : "/"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Giriş yapılamadı."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] lg:grid lg:grid-cols-2">
      {/* LEFT */}
      <section className="hidden bg-[#082d4e] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-2xl font-black">
            LEZZET DÖNER
          </p>

          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
            Yönetim Paneli
          </p>
        </div>

        <div className="max-w-lg">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500">
            <ShieldCheck
              size={28}
            />
          </div>

          <h1 className="text-4xl font-black leading-tight">
            İşletmenizi tek
            panelden yönetin.
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            Kurye operasyonu,
            günlük kasa ve aylık
            finansal sonuçlar güvenli
            şekilde tek yerde.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          Lezzet Döner Yönetim
          Sistemi
        </p>
      </section>

      {/* LOGIN */}
      <section className="flex min-h-screen items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* MOBILE BRAND */}
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xl font-black text-[#082d4e]">
              LEZZET DÖNER
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Yönetim Paneli
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <LockKeyhole
                size={23}
              />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Giriş Yap
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Yönetim paneline devam
              etmek için hesabınızla
              giriş yapın.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-6"
            >
              <label className="text-xs font-bold text-slate-600">
                E-posta
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  autoComplete="username"
                  className="min-h-[54px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  placeholder="E-posta adresiniz"
                />
              </div>

              <label className="mt-5 block text-xs font-bold text-slate-600">
                Şifre
              </label>

              <div className="relative mt-2">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  autoComplete="current-password"
                  className="min-h-[54px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  placeholder="Şifreniz"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value
                    )
                  }
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !email.trim() ||
                  !password
                }
                className="mt-6 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <LogIn
                    size={19}
                  />
                )}

                {loading
                  ? "Giriş Yapılıyor..."
                  : "Giriş Yap"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            Yetkisiz erişim
            engellenmektedir.
          </p>
        </div>
      </section>
    </main>
  );
}