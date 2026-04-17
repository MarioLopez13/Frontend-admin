import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "@/app/config/routes";
import UserEditForm from "../components/UserEditForm";
import { usersService } from "../services/users.service";
import type {
  UpdateUserRequest,
  UserAdminView,
} from "../types/user-admin.types";

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserAdminView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadUser = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError("");

      const result = await usersService.getUserById(id);

      if (!result) {
        setError("Usuario no encontrado.");
        return;
      }

      setUser(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el usuario.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
  }, [id]);

  const handleSubmit = async (payload: UpdateUserRequest) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError("");

      const updatedUser = await usersService.updateUser(id, payload);

      navigate(routes.userDetail(id), {
        replace: true,
        state: {
          feedback: `Cambios guardados correctamente para ${updatedUser.fullName}.`,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el usuario.";
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Cargando usuario...
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Usuario no encontrado."}
        </div>

        <button
          onClick={() => navigate(routes.users)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Volver
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar usuario</h1>
          <p className="text-sm text-slate-500">
            Actualiza nombre y correo del usuario final.
          </p>
        </div>

        <button
          onClick={() => navigate(routes.userDetail(user.id))}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <UserEditForm
        user={user}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}