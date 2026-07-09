import { useEffect, useState } from "react";
import { exportCsv } from "@/shared/utils/exportCsv";

import { env } from "@/app/config/env";

const API_BASE_URL = env.apiBaseUrl;

type PaymentView = {
  id: string;
  busCode: string;
  routeName: string;
  method: string;
  amount: number;
  status: string;
  createdAt: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function getStatusLabel(status: string) {
  switch (status) {
    case "APPROVED":
      return "Aprobado";
    case "PENDING":
      return "Pendiente";
    case "FAILED":
      return "Fallido";
    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "APPROVED":
      return "border-green-200 bg-green-50 text-green-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentView[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
  try {
    const token =
      localStorage.getItem("accessToken") ??
      localStorage.getItem("token") ??
      localStorage.getItem("authToken");

    const response = await fetch(`${API_BASE_URL}/mobile-payments`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Client-Token":
          "pQfoROQs2QG0WuXwLvuCHocprzq87w774sF5XtVhuMU",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const items = data.items ?? data.data ?? [];

    const mapped: PaymentView[] = items.map((item: any) => ({
      id: item.id ?? item.transactionId ?? "",
      busCode: item.busCode ?? "Sin unidad",
      routeName: item.routeName ?? "Sin ruta",
      method: item.method ?? "QR",
      amount: Number(item.amount ?? 0),
      status:
        item.status === "Completado" ? "APPROVED" : "PENDING",
      createdAt: item.processedAt ?? "",
    }));

    const filtered = mapped.filter(
      (item) => item.method === "QR" || item.method === "NFC"
    );

    setPayments(filtered);
  } catch (error) {
    console.error(error);
  }
}

  const handleExportPayments = () => {
    exportCsv(
      "smartpayut_pagos",
      payments.map((payment) => ({
        ID: payment.id,
        Unidad: payment.busCode,
        Ruta: payment.routeName,
        Método: payment.method,
        Monto: payment.amount.toFixed(2),
        Estado: getStatusLabel(payment.status),
        Fecha: payment.createdAt
          ? new Date(payment.createdAt).toLocaleString("es-EC")
          : "-",
      })),
      "No existen pagos para exportar."
    );
  };

  const approved = payments.filter(
    (payment) => payment.status === "APPROVED"
  ).length;

  const pending = payments.filter(
    (payment) => payment.status === "PENDING"
  ).length;

  const failed = payments.filter(
    (payment) => payment.status === "FAILED"
  ).length;

  const totalAmount = payments
    .filter((payment) => payment.status === "APPROVED")
    .reduce((acc, payment) => acc + payment.amount, 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
          <p className="text-sm text-slate-500">
            Monitoreo administrativo de pagos registrados en el sistema.
          </p>
        </div>

        <button
          onClick={handleExportPayments}
          className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
        >
          Exportar CSV
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Transacciones</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {payments.length}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Aprobadas</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {approved}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pendientes</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {pending}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Monto aprobado</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(totalAmount)}
          </p>
        </article>
      </div>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Últimas transacciones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Ruta</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {payment.id}
                  </td>

                  <td className="px-4 py-3">
                    {payment.busCode}
                  </td>

                  <td className="px-4 py-3">
                    {payment.routeName}
                  </td>

                  <td className="px-4 py-3">
                    {payment.method}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(payment.amount)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        payment.status
                      )}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {new Date(payment.createdAt).toLocaleString("es-EC")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}