import type {
  AdminTransaction,
  AdminTransactionView,
} from "../types/transaction.types";

const typeLabels: Record<string, string> = {
  PAYMENT: "Pago",
  TOP_UP: "Recarga",
  CREDIT: "Crédito",
  DEBIT: "Débito",
  REFUND: "Reembolso",
  WALLET_CREATED: "Creación de billetera",
};

const methodLabels: Record<string, string> = {
  QR: "QR",
  NFC: "NFC",
  PLACETOPAY: "PlaceToPay",
};

const statusLabels: Record<string, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  FAILED: "Fallida",
  REFUNDED: "Reembolsada",
};

function labelFor(value: string, labels: Record<string, string>): string {
  return labels[value.toUpperCase()] ?? value;
}

export function mapAdminTransaction(
  transaction: AdminTransaction
): AdminTransactionView {
  return {
    ...transaction,
    typeLabel: labelFor(transaction.type, typeLabels),
    methodLabel: transaction.method
      ? labelFor(transaction.method, methodLabels)
      : "Sin método",
    statusLabel: labelFor(transaction.status, statusLabels),
    userLabel: transaction.userId ?? "—",
    busLabel: transaction.busCode ?? "—",
    routeLabel: transaction.routeName ?? "—",
  };
}

export function formatTransactionDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
    timeZone: "America/Guayaquil",
  }).format(date);
}
