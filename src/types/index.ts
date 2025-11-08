export interface SalesData {
  id_transaksi: string;
  nama_pelanggan: string;
  produk: string;
  qty: number;
  harga: number;
  total_harga: number;
  tanggal: string;
}

export interface FilterState {
  tanggal?: string;
  produk?: string;
  pelanggan?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: SalesData[];
}
