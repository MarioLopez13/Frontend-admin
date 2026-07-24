export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AdminPayment = {
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

export type AdminPaymentView = AdminPayment & {
  methodLabel: string;
  statusLabel: string;
  userLabel: string;
  busLabel: string;
  routeLabel: string;
};
