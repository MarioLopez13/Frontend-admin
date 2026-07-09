type CsvValue = string | number | boolean | null | undefined | Date;

export type CsvRow = Record<string, CsvValue>;

function formatCsvValue(value: CsvValue) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const text = String(value).replace(/\r?\n|\r/g, " ").trim();

  if (text.includes(";") || text.includes('"') || text.includes(",")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function getCurrentDateForFileName() {
  return new Date().toISOString().slice(0, 10);
}

export function exportCsv(
  baseFileName: string,
  rows: CsvRow[],
  emptyMessage = "No existen datos para exportar."
) {
  if (rows.length === 0) {
    window.alert(emptyMessage);
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(";"),
    ...rows.map((row) =>
      headers.map((header) => formatCsvValue(row[header])).join(";")
    ),
  ];

  const csvContent = `\uFEFF${csvLines.join("\n")}`;
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${baseFileName}_${getCurrentDateForFileName()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
