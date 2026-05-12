export type PaymentMethod = "QR" | "NFC";
export type PaymentStatus = "APPROVED" | "PENDING" | "FAILED";

export type QrUnit = {
  id: string;
  code: string;
  busLabel: string;
  routeName: string;
  driverName: string;
  amount: number;
  active: boolean;
};

export type PaymentTransaction = {
  id: string;
  qrCode: string;
  busLabel: string;
  routeName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
};