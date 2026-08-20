"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Check,
  Edit3,
  KeyRound,
  LoaderCircle,
  Plus,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  Users,
  X,
} from "lucide-react";

import {
  createUser,
  getUsers,
  resetUserPassword,
  updateUser,
  type ManagedUser,
  type UserRole,
} from "@/lib/users-api";

type UserForm = {
  id: number | null;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
};

const emptyForm: UserForm = {
  id: null,
  fullName: "",
  email: "",
  password: "",
  role: "PAKETCI",
  active: true,
};

export default function SettingsPage() {
  const [users, setUsers] =
    useState<ManagedUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    passwordModalOpen,
    setPasswordModalOpen,
  ] = useState(false);

  const [
    passwordUser,
    setPasswordUser,
  ] =
    useState<ManagedUser | null>(
      null
    );

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [form, setForm] =
    useState<UserForm>(
      emptyForm
    );

  const loadUsers =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getUsers();

        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Kullanıcılar yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(
    user: ManagedUser
  ) {
    setForm({
      id: user.id,
      fullName:
        user.fullName,
      email: user.email,
      password: "",
      role: user.role,
      active:
        user.active,
    });

    setModalOpen(true);
  }

  function openPassword(
    user: ManagedUser
  ) {
    setPasswordUser(user);
    setNewPassword("");
    setPasswordModalOpen(
      true
    );
  }

  async function saveUser() {
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      processing
    ) {
      return;
    }

    if (
      !form.id &&
      form.password.length < 8
    ) {
      setError(
        "Yeni kullanıcı şifresi en az 8 karakter olmalıdır."
      );

      return;
    }

    try {
      setProcessing(true);
      setError(null);

      if (form.id) {
        await updateUser(
          form.id,
          form.fullName,
          form.email,
          form.role,
          form.active
        );
      } else {
        await createUser(
          form.fullName,
          form.email,
          form.password,
          form.role
        );
      }

      setModalOpen(false);
      setForm(emptyForm);

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kullanıcı kaydedilemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function savePassword() {
    if (
      !passwordUser ||
      newPassword.length < 8 ||
      processing
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await resetUserPassword(
        passwordUser.id,
        newPassword
      );

      setPasswordModalOpen(
        false
      );

      setPasswordUser(null);
      setNewPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Şifre değiştirilemedi."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <LoaderCircle
          size={34}
          className="animate-spin text-orange-500"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <Users
                size={24}
                className="text-orange-500"
              />

              <h1 className="text-xl font-bold sm:text-2xl">
                Kullanıcı Yönetimi
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Yönetici ve paket
              personeli hesaplarını
              yönetin.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white"
          >
            <Plus size={18} />
            Kullanıcı Ekle
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid gap-3">
          {users.map(
            (user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex sm:items-center sm:gap-4"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    user.active
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {user.active ? (
                    <UserRoundCheck
                      size={21}
                    />
                  ) : (
                    <UserRoundX
                      size={21}
                    />
                  )}
                </div>

                <div className="mt-3 min-w-0 flex-1 sm:mt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">
                      {user.fullName}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        user.role ===
                        "ADMIN"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {user.role ===
                      "ADMIN"
                        ? "Yönetici"
                        : "Paket Personeli"}
                    </span>

                    {!user.active && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                        Pasif
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-0 sm:flex">
                  <button
                    type="button"
                    onClick={() =>
                      openEdit(
                        user
                      )
                    }
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600"
                  >
                    <Edit3
                      size={16}
                    />
                    Düzenle
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openPassword(
                        user
                      )
                    }
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600"
                  >
                    <KeyRound
                      size={16}
                    />
                    Şifre
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {form.id
                    ? "Kullanıcıyı Düzenle"
                    : "Kullanıcı Ekle"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Personel hesabı ve
                  yetkisini belirleyin.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mt-5 block text-xs font-bold text-slate-500">
              Ad Soyad
            </label>

            <input
              value={form.fullName}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    fullName:
                      event.target
                        .value,
                  })
                )
              }
              className="mt-2 min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-400"
            />

            <label className="mt-4 block text-xs font-bold text-slate-500">
              E-posta
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    email:
                      event.target
                        .value,
                  })
                )
              }
              className="mt-2 min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-400"
            />

            {!form.id && (
              <>
                <label className="mt-4 block text-xs font-bold text-slate-500">
                  İlk Şifre
                </label>

                <input
                  type="password"
                  value={
                    form.password
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        password:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="mt-2 min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-400"
                  placeholder="En az 8 karakter"
                />
              </>
            )}

            <label className="mt-4 block text-xs font-bold text-slate-500">
              Rol
            </label>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <RoleButton
                active={
                  form.role ===
                  "ADMIN"
                }
                label="Yönetici"
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
                onClick={() =>
                  setForm(
                    (current) => ({
                      ...current,
                      role: "ADMIN",
                    })
                  )
                }
              />

              <RoleButton
                active={
                  form.role ===
                  "PAKETCI"
                }
                label="Paket Personeli"
                icon={
                  <UserRound
                    size={18}
                  />
                }
                onClick={() =>
                  setForm(
                    (current) => ({
                      ...current,
                      role: "PAKETCI",
                    })
                  )
                }
              />
            </div>

            {form.id && (
              <label className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-bold">
                    Kullanıcı Aktif
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Pasif hesap giriş
                    yapamaz.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.active
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        active:
                          event.target
                            .checked,
                      })
                    )
                  }
                  className="h-5 w-5"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() =>
                void saveUser()
              }
              disabled={
                processing
              }
              className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white disabled:opacity-50"
            >
              {processing ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Check size={19} />
              )}

              Kaydet
            </button>
          </div>
        </div>
      )}

      {passwordModalOpen &&
        passwordUser && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
            <div className="w-full rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Şifre Değiştir
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      passwordUser.fullName
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPasswordModalOpen(
                      false
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="mt-5 block text-xs font-bold text-slate-500">
                Yeni Şifre
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target
                      .value
                  )
                }
                placeholder="En az 8 karakter"
                className="mt-2 min-h-[52px] w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-400"
              />

              <button
                type="button"
                onClick={() =>
                  void savePassword()
                }
                disabled={
                  processing ||
                  newPassword.length <
                    8
                }
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white disabled:opacity-50"
              >
                <KeyRound
                  size={18}
                />
                Şifreyi Güncelle
              </button>
            </div>
          </div>
        )}
    </main>
  );
}

function RoleButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border text-xs font-bold ${
        active
          ? "border-orange-400 bg-orange-50 text-orange-600"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}