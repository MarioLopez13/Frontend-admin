export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type QrPayment = {
  id: string;
  transactionId: string;
  userId: string;
  method: string | null;
  paymentStatus: string;
  status: string;
  amount: number;
  currency: string;
  busCode: string | null;
  routeName: string | null;
  previousBalance: number | null;
  updatedBalance: number | null;
  processedAt: string;
  failureReason: string | null;
};

export type QrUnitView = {
  id: string;
  code: string;
  busLabel: string;
  routeName: string;
  driverName: string;
  amount: number;
  currency: string;
  active: boolean;
  lastPaymentAt: string;
};
