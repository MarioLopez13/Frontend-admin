import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { authStorage } from "@/core/auth/auth.storage";
import { groupQrUnits } from "./qr.adapter";
import type {
  ApiResponse,
  QrPayment,
  QrUnitView,
} from "../types/qr.types";

function qrError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      authStorage.clearSession();
      window.location.assign("/login");

      throw new Error(
        "Tu sesión expiró. Vuelve a iniciar sesión para consultar las unidades QR."
      );
    }

    if (error.status === 403) {
      throw new Error("No tienes permisos para consultar las unidades QR.");
    }

    if (error.status === 404) {
      throw new Error("No se encontró el recurso de pagos para unidades QR.");
    }

    if (error.status && error.status >= 500) {
      throw new Error(
        "Payment Service no está disponible. Intenta nuevamente."
      );
    }
  }

  throw new Error("No se pudieron cargar las unidades QR.");
}

export async function getQrUnits(): Promise<QrUnitView[]> {
  try {
    const response = await apiClient<ApiResponse<QrPayment[]>>(
      endpoints.payments.admin
    );

    return groupQrUnits(response.data);
  } catch (error) {
    return qrError(error);
  }
}

export const qrService = {
  getQrUnits,
};
