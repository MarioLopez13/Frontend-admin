export type UserStatus = "active" | "inactive";

export interface UserAdminView {
  id: string;
  userName: string;
  name: string;
  lastName: string;
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

export interface UsersPageResult {
  items: UserAdminView[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  name: string;
  lastName: string;
  password: string;
}

export interface UpdateUserRequest {
  name: string;
  lastName: string;
  email: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}
