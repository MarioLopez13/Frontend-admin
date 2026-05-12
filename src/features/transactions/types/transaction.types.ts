export type TransactionMethod = "QR" | "NFC";
export type TransactionStatus = "APPROVED" | "PENDING" | "FAILED" | "CANCELLED";

export interface TransactionView {
  id: string;
  reference: string;
  userName: string;
  userEmail: string;
  method: TransactionMethod;
  status: TransactionStatus;
  amount: number;
  busCode: string;
  busLabel: string;
  routeName: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  technicalMessage?: string;
}

export interface TransactionFilters {
  search: string;
  status: "all" | TransactionStatus;
  method: "all" | TransactionMethod;
  dateFrom: string;
  dateTo: string;
}

export interface TransactionSummary {
  total: number;
  approved: number;
  pending: number;
  failed: number;
  cancelled: number;
  approvedAmount: number;
}
