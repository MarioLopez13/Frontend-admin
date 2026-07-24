export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AdminTransaction = {
  id: string;
  correlationId: string | null;
  type: string;
  method: string | null;
  status: string;
  amount: number;
  occurredAt: string;
  userId: string | null;
  walletId: string | null;
  busCode: string | null;
  routeName: string | null;
  balanceBefore: number | null;
  balanceAfter: number | null;
  currency: string;
  failureReason: string | null;
};

export type TransactionPageData = {
  items: AdminTransaction[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
};

export type AdminTransactionView = AdminTransaction & {
  typeLabel: string;
  methodLabel: string;
  statusLabel: string;
  userLabel: string;
  busLabel: string;
  routeLabel: string;
};

export type AdminTransactionPage = Omit<TransactionPageData, "items"> & {
  items: AdminTransactionView[];
};

export type TransactionFilters = {
  search: string;
  status: "all" | string;
  method: "all" | string;
  type: "all" | string;
  from: string;
  to: string;
};

export type GetAdminTransactionsParams = Partial<TransactionFilters> & {
  page: number;
  pageSize: number;
};
