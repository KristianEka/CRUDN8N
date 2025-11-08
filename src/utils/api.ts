import { SalesData } from "../types";

const N8N_BASE_URL = (
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  "https://your-n8n-instance.com/webhook"
).replace(/\/$/, "");

const withBasePath = (path: string) =>
  `${N8N_BASE_URL}/${path.replace(/^\//, "")}`;
const buildDownloadUrl = (format: "csv" | "xlsx") => {
  const url = new URL(withBasePath("get-file"));
  url.searchParams.set("format", format);
  return url.toString();
};

const padTwoDigits = (value: number) => value.toString().padStart(2, "0");

const formatDateForPayload = (dateString?: string | null): string => {
  if (!dateString) {
    return "";
  }

  const trimmed = dateString.trim();
  if (!trimmed) {
    return "";
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-");
    return `${day}-${month}-${year}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  const day = padTwoDigits(parsed.getDate());
  const month = padTwoDigits(parsed.getMonth() + 1);
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

const toFormPayload = (salesData: Partial<SalesData>) => {
  const params = new URLSearchParams();

  if (salesData.nama_pelanggan !== undefined) {
    params.set("namaPelanggan", salesData.nama_pelanggan);
  }

  if (salesData.produk !== undefined) {
    params.set("produk", salesData.produk);
  }

  if (typeof salesData.qty === "number" && Number.isFinite(salesData.qty)) {
    params.set("qty", String(salesData.qty));
  }

  if (typeof salesData.harga === "number" && Number.isFinite(salesData.harga)) {
    params.set("harga", String(salesData.harga));
  }

  const totalHarga =
    typeof salesData.total_harga === "number" &&
    Number.isFinite(salesData.total_harga)
      ? salesData.total_harga
      : typeof salesData.qty === "number" && typeof salesData.harga === "number"
      ? salesData.qty * salesData.harga
      : undefined;

  if (totalHarga !== undefined) {
    params.set("totalHarga", String(totalHarga));
  }

  const formattedDate = formatDateForPayload(salesData.tanggal);
  if (formattedDate) {
    params.set("tanggal", formattedDate);
  }

  return params;
};

const parseJsonSafely = async (response: Response): Promise<unknown | null> => {
  const text = await response.text();

  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn("Tidak dapat mem-parse respon JSON dari n8n:", error, text);
    return null;
  }
};

const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));
const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;

const excelSerialToISO = (serial: number) => {
  const date = new Date(EXCEL_EPOCH.getTime() + serial * MILLIS_IN_DAY);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const parseNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const parseString = (value: unknown, fallback = ""): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
};

const parseDateValue = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return excelSerialToISO(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (/^\d+$/.test(trimmed)) {
      return excelSerialToISO(Number(trimmed));
    }

    if (/^\d{2}-\d{2}-\d{2}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split("-").map(Number);
      const normalizedYear = year + (year < 100 ? 2000 : 0);
      const date = new Date(Date.UTC(normalizedYear, month - 1, day));
      return Number.isNaN(date.getTime())
        ? ""
        : date.toISOString().split("T")[0];
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime())
      ? trimmed
      : parsed.toISOString().split("T")[0];
  }

  return "";
};

const normalizeSalesData = (
  item: Record<string, unknown>,
  index: number
): SalesData => {
  const getValue = (key: string) => item[key];

  const idValue =
    getValue("ID Transaksi") ??
    getValue("id_transaksi") ??
    getValue("id") ??
    getValue("row_number") ??
    index + 1;

  const qty = parseNumber(getValue("Qty") ?? getValue("qty"));
  const harga = parseNumber(getValue("Harga") ?? getValue("harga"));
  const total = parseNumber(getValue("Total Harga") ?? getValue("total_harga"));

  return {
    id_transaksi: parseString(idValue, `row-${index + 1}`),
    nama_pelanggan: parseString(
      getValue("Nama Pelanggan") ?? getValue("nama_pelanggan")
    ),
    produk: parseString(getValue("Produk") ?? getValue("produk")),
    qty,
    harga,
    total_harga: total || qty * harga,
    tanggal:
      parseDateValue(getValue("Tanggal") ?? getValue("tanggal")) ||
      new Date().toISOString().split("T")[0],
  };
};

export const api = {
  async fetchSalesData(): Promise<SalesData[]> {
    try {
      const response = await fetch(withBasePath("get-list"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data penjualan");
      }

      const raw = await parseJsonSafely(response);
      const rows: unknown[] = Array.isArray(raw)
        ? raw
        : raw &&
          typeof raw === "object" &&
          Array.isArray((raw as Record<string, unknown>).data)
        ? ((raw as Record<string, unknown>).data as unknown[])
        : [];

      return rows
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        )
        .map(normalizeSalesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      throw error;
    }
  },

  async createSalesData(
    salesData: Omit<SalesData, "id_transaksi">
  ): Promise<SalesData> {
    try {
      const response = await fetch(withBasePath("add-data"), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: toFormPayload(salesData).toString(),
      });

      if (!response.ok) {
        throw new Error("Gagal menambah data penjualan");
      }

      const data = await parseJsonSafely(response);
      if (!data || typeof data !== "object") {
        throw new Error("Respon n8n tidak valid saat menambah data penjualan");
      }

      return data as SalesData;
    } catch (error) {
      console.error("Error creating sales data:", error);
      throw error;
    }
  },

  async updateSalesData(
    id: string,
    salesData: Partial<SalesData>
  ): Promise<SalesData> {
    try {
      const url = new URL(withBasePath("edit-data"));
      url.searchParams.set("id", id);

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: toFormPayload(salesData).toString(),
      });

      if (!response.ok) {
        throw new Error("Gagal mengupdate data penjualan");
      }

      const data = await parseJsonSafely(response);
      if (!data || typeof data !== "object") {
        throw new Error(
          "Respon n8n tidak valid saat mengupdate data penjualan"
        );
      }

      return data as SalesData;
    } catch (error) {
      console.error("Error updating sales data:", error);
      throw error;
    }
  },

  async deleteSalesData(id: string): Promise<void> {
    try {
      const url = new URL(withBasePath("delete-row"));
      url.searchParams.set("id", id);

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus data penjualan");
      }
    } catch (error) {
      console.error("Error deleting sales data:", error);
      throw error;
    }
  },

  async uploadFile(file: File): Promise<{ status: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(withBasePath("send-file"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal mengupload file");
      }

      const data = await parseJsonSafely(response);
      if (!data || typeof data !== "object") {
        throw new Error("Respon n8n tidak valid saat mengupload file");
      }

      const payload = data as { status?: string; message?: string };
      if (payload.status && payload.status !== "success") {
        throw new Error(payload.message || "Gagal mengupload file");
      }

      return payload;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  async downloadFile(
    format: "csv" | "xlsx" = "xlsx"
  ): Promise<{ blob: Blob; filename: string }> {
    try {
      const response = await fetch(buildDownloadUrl(format), {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Gagal mengunduh file ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition?.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i
      );
      const filename = filenameMatch
        ? filenameMatch[1].replace(/['"]/g, "").trim()
        : `data-penjualan.${format}`;

      return { blob, filename };
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },
};
