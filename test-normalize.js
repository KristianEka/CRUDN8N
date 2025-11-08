// Test data similar to what we get from the API
const testData = [
  {
    row_number: 2,
    "ID Transaksi": 1001,
    "Nama Pelanggan": "Budi Santoso",
    Produk: "Produk A",
    Qty: 2,
    Harga: 100,
    "Total Harga": 200,
    Tanggal: "11-01-25",
  },
  {
    row_number: 6,
    "ID Transaksi": "dsa",
    "Nama Pelanggan": "dsadas",
    Produk: "das",
    Qty: "asdsa",
    Harga: "dasdas",
    "Total Harga": "ddas",
    Tanggal: "dasd",
  },
];

// Simple parse functions based on the ones in api.ts
const parseNumber = (value) => {
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

const parseString = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
};

const parseDateValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    // Simplified for test
    return value.toString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (/^\d{2}-\d{2}-\d{2}$/.test(trimmed)) {
      // This is the format we get from the API
      return trimmed; // Just return as is for now
    }
  }

  return "";
};

const normalizeSalesData = (item, index) => {
  const getValue = (key) => item[key];

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

// Test the normalization
console.log("Testing data normalization:");
testData.forEach((item, index) => {
  const normalized = normalizeSalesData(item, index);
  console.log(`Item ${index + 1}:`, normalized);
});
