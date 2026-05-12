import type { UserAdminView } from "../types/user-admin.types";

export const usersMock: UserAdminView[] = [
  {
    id: "u-001",
    fullName: "Juan Pérez",
    email: "juan.perez@email.com",
    role: "user",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "u-002",
    fullName: "María López",
    email: "maria.lopez@email.com",
    role: "user",
    status: "inactive",
    createdAt: "2026-03-02T09:30:00Z",
    updatedAt: "2026-03-11T11:20:00Z",
  },
  {
    id: "u-003",
    fullName: "Carlos Andrade",
    email: "carlos.andrade@email.com",
    role: "user",
    status: "active",
    createdAt: "2026-03-04T16:45:00Z",
    updatedAt: "2026-03-12T08:15:00Z",
  },
  {
    id: "u-004",
    fullName: "Ana Torres",
    email: "ana.torres@email.com",
    role: "user",
    status: "active",
    createdAt: "2026-03-05T12:10:00Z",
    updatedAt: "2026-03-13T13:50:00Z",
  },
  {
    id: "u-005",
    fullName: "Pedro Zambrano",
    email: "pedro.zambrano@email.com",
    role: "user",
    status: "inactive",
    createdAt: "2026-03-06T08:05:00Z",
    updatedAt: "2026-03-14T09:40:00Z",
  },
];