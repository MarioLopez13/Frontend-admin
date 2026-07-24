import type {
  AdminPayment,
  AdminPaymentView,
} from "../types/payment.types";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

function labelFor(value: string, labels: Record<string, string>): string {
  return labels[value.toUpperCase()] ?? value;
}

export function isQrOrNfcPayment(payment: AdminPayment): boolean {
  const method = payment.method?.toUpperCase();
  return method === "QR" || method === "NFC";
}

export function mapAdminPayment(payment: AdminPayment): AdminPaymentView {
  return {
    ...payment,
    methodLabel: payment.method?.toUpperCase() ?? "Sin método",
    statusLabel: labelFor(payment.paymentStatus, statusLabels),
    userLabel: payment.userId || "—",
    busLabel: payment.busCode || "Sin unidad",
    routeLabel: payment.routeName || "Sin ruta",
  };
}

export function formatPaymentDate(value: string): string {
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
