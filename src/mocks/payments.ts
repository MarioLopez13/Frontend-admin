import type { PaymentTransaction } from "@/types/payment";

export const mockPayments: PaymentTransaction[] = [
  {
    id: "p1",
    qrCode: "BUS-001",
    busLabel: "Unidad 001",
    routeName: "Ruta Norte",
    amount: 0.35,
    method: "QR",
    status: "APPROVED",
    createdAt: "2026-03-24 10:30",
  },
  {
    id: "p2",
    qrCode: "BUS-002",
    busLabel: "Unidad 002",
    routeName: "Ruta Centro",
    amount: 0.35,
    method: "QR",
    status: "PENDING",
    createdAt: "2026-03-24 11:05",
  },
  {
    id: "p3",
    qrCode: "BUS-003",
    busLabel: "Unidad 003",
    routeName: "Ruta Sur",
    amount: 0.40,
    method: "QR",
    status: "FAILED",
    createdAt: "2026-03-24 11:40",
  },
];