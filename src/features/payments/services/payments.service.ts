import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { authStorage } from "@/core/auth/auth.storage";
import {
  isQrOrNfcPayment,
  mapAdminPayment,
} from "./payments.adapter";
import type {
  AdminPayment,
  AdminPaymentView,
  ApiResponse,
} from "../types/payment.types";

function paymentError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      authStorage.clearSession();
      window.location.assign("/login");

      throw new Error(
        "Tu sesión expiró. Vuelve a iniciar sesión para consultar los pagos."
      );
    }

    if (error.status === 403) {
      throw new Error("No tienes permisos para consultar los pagos.");
    }

    if (error.status === 404) {
      throw new Error("No se encontró el recurso administrativo de pagos.");
    }

    if (error.status && error.status >= 500) {
      throw new Error(
        "Payment Service no está disponible. Intenta nuevamente."
      );
    }
  }

  throw new Error("No se pudieron cargar los pagos.");
}

export async function getAdminPayments(): Promise<AdminPaymentView[]> {
  try {
    const response = await apiClient<ApiResponse<AdminPayment[]>>(
      endpoints.payments.admin
    );

    return response.data
      .filter(isQrOrNfcPayment)
      .map(mapAdminPayment);
  } catch (error) {
    return paymentError(error);
  }
}

export const paymentsService = {
  getAdminPayments,
};
