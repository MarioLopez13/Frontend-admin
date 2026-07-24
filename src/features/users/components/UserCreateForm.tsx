import { useState } from "react";
import type { CreateUserRequest } from "../types/user-admin.types";

type UserCreateFormProps = {
  onSubmit: (payload: CreateUserRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

export default function UserCreateForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: UserCreateFormProps) {
  const [form, setForm] = useState<CreateUserRequest>({
    userName: "",
    email: "",
    name: "",
    lastName: "",
    password: "",
  });
  const [error, setError] = useState("");

  const update = (field: keyof CreateUserRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Ingrese un correo válido.");
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear el usuario."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Username
          <input
            value={form.userName}
            onChange={(event) => update("userName", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Correo electrónico
          <input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Nombre
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Apellido
          <input
            value={form.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creando..." : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
