import type { UserAdminView } from "../types/user-admin.types";

type BackendUser = {
  id: string;
  fullName: string;
  email: string;
  status: "active" | "inactive";
  role?: "user";
  createdAt: string;
  updatedAt: string;
};

type UsersListResponse = {
  items: BackendUser[];
  total: number;
  page: number;
  pageSize: number;
};

export function mapBackendUserToAdminView(user: BackendUser): UserAdminView {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: "user",
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapUsersListResponseToAdminViews(
  response: UsersListResponse
): UserAdminView[] {
  return response.items.map(mapBackendUserToAdminView);
}