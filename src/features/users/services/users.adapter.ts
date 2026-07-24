import type { UserAdminView } from "../types/user-admin.types";

type BackendUser = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  name: string;
  lastName: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: string;
  updatedAt: string;
  image?: string | null;
};

export type UsersSearchResponse = {
  items: BackendUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function mapBackendUserToAdminView(user: BackendUser): UserAdminView {
  return {
    id: user.id,
    userName: user.userName,
    name: user.name,
    lastName: user.lastName,
    fullName: `${user.name} ${user.lastName}`.trim(),
    email: user.email,
    role: "user",
    status: user.status === "ACTIVE" ? "active" : "inactive",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export type { BackendUser };
