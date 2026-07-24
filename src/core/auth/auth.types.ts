export type AppRole = "admin" | "operator" | "user";

export type AppPermission =
  | "dashboard:view"
  | "users:view"
  | "users:edit"
  | "users:status"
  | "payments:view"
  | "transactions:view"
  | "qr:view";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface IdentityLoginResponse {
  userId: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse extends AuthSession {}
