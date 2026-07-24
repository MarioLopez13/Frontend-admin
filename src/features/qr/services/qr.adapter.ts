import type { QrPayment, QrUnitView } from "../types/qr.types";

function isQrPayment(payment: QrPayment): boolean {
  return payment.method?.toUpperCase() === "QR";
}

function normalizedBusCode(payment: QrPayment): string {
  return payment.busCode?.trim() ?? "";
}

function paymentTimestamp(payment: QrPayment): number {
  const timestamp = new Date(payment.processedAt).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function toQrUnit(payment: QrPayment, busCode: string): QrUnitView {
  return {
    id: busCode,
    code: busCode,
    busLabel: `Unidad ${busCode}`,
    routeName: payment.routeName?.trim() || "Sin ruta",
    driverName: "Sin información",
    amount: payment.amount,
    currency: payment.currency,
    active: true,
    lastPaymentAt: payment.processedAt,
  };
}

export function groupQrUnits(payments: QrPayment[]): QrUnitView[] {
  const units = new Map<
    string,
    { unit: QrUnitView; timestamp: number }
  >();

  payments.forEach((payment) => {
    if (!isQrPayment(payment)) {
      return;
    }

    const busCode = normalizedBusCode(payment);

    if (!busCode) {
      return;
    }

    const timestamp = paymentTimestamp(payment);
    const current = units.get(busCode);

    if (!current || timestamp > current.timestamp) {
      units.set(busCode, {
        unit: toQrUnit(payment, busCode),
        timestamp,
      });
    }
  });

  return Array.from(units.values())
    .map(({ unit }) => unit)
    .sort((first, second) => first.code.localeCompare(second.code));
}
