export type UserStatus = "active" | "inactive";

export interface UserAdminView {
  id: string;
  fullName: string;
  email: string;
  role: "user";
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search: string;
  status: "all" | "active" | "inactive";
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}