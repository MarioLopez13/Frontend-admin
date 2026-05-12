import type { QrUnit } from "@/types/payment";

export const mockQrUnits: QrUnit[] = [
  {
    id: "u1",
    code: "BUS-001",
    busLabel: "Unidad 001",
    routeName: "Ruta Norte",
    driverName: "Carlos Mena",
    amount: 0.35,
    active: true,
  },
  {
    id: "u2",
    code: "BUS-002",
    busLabel: "Unidad 002",
    routeName: "Ruta Centro",
    driverName: "Ana Ruiz",
    amount: 0.35,
    active: true,
  },
  {
    id: "u3",
    code: "BUS-003",
    busLabel: "Unidad 003",
    routeName: "Ruta Sur",
    driverName: "Luis Pérez",
    amount: 0.40,
    active: false,
  },
];