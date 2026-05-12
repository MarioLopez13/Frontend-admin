import type { UserFilters } from "../types/user-admin.types";

type UserFiltersProps = {
  value: UserFilters;
  onChange: (value: UserFilters) => void;
};

export default function UserFiltersComponent({
  value,
  onChange,
}: UserFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Buscar por nombre o correo
        </label>
        <input
          type="text"
          value={value.search}
          onChange={(event) =>
            onChange({
              ...value,
              search: event.target.value,
            })
          }
          placeholder="Ej. Juan Pérez o correo@email.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Estado
        </label>
        <select
          value={value.status}
          onChange={(event) =>
            onChange({
              ...value,
              status: event.target.value as UserFilters["status"],
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>
  );
}