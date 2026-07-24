export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type UserSummaryData = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  deletedUsers: number;
};

export type DailyOperation = {
  date: string;
  count: number;
};

export type TransactionDashboardData = {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  approvedAmount: number;
  operationsByMethod: Record<string, number>;
  dailyOperations: DailyOperation[];
};

export type DashboardOperationByMethod = {
  method: string;
  operations: number;
};

export type DashboardDailyOperation = {
  date: string;
  operations: number;
};

export type DashboardSummaryViewModel = {
  userSummary: UserSummaryData;
  transactionSummary: TransactionDashboardData;
  operationsByMethod: DashboardOperationByMethod[];
  dailyOperations: DashboardDailyOperation[];
};
