import { useState } from "react";
import type { UpdateUserRequest, UserAdminView } from "../types/user-admin.types";

type UserEditFormProps = {
  user: UserAdminView;
  onSubmit: (payload: UpdateUserRequest) => Promise<void>;
  isSubmitting?: boolean;
};

export default function UserEditForm({
  user,
  onSubmit,
  isSubmitting = false,
}: UserEditFormProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");

  const validate = () => {
    const nextErrors: { fullName?: string; email?: string } = {};

    if (!fullName.trim()) nextErrors.fullName = "El nombre es obligatorio.";
    if (!email.trim()) nextErrors.email = "El correo es obligatorio.";
    else if (!email.includes("@")) nextErrors.email = "Correo inválido.";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    try {
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar.";
      setGeneralError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Nombre completo
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
          placeholder="Ej. Juan Pérez"
        />
        {fieldErrors.fullName && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
          placeholder="Ej. correo@email.com"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      {generalError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}