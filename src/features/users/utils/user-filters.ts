import type { UserAdminView, UserFilters } from "../types/user-admin.types";

export function filterUsers(users: UserAdminView[], filters: UserFilters) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      !normalizedSearch ||
      user.fullName.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      filters.status === "all" ? true : user.status === filters.status;

    return matchesSearch && matchesStatus;
  });
}