import { useState, useMemo } from "react";
import { Edit2, Trash2, Search, Filter, RefreshCw } from "lucide-react";
import { SalesData, FilterState } from "../types";
import { formatCurrency, formatDate } from "../utils/fileGenerator";

interface SalesTableProps {
  data: SalesData[];
  onEdit: (item: SalesData) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const SalesTable = ({
  data,
  onEdit,
  onDelete,
  onRefresh,
  loading = false,
}: SalesTableProps) => {
  // Define state for filters
  const [filters, setFilters] = useState<FilterState>({
    tanggal: "",
    produk: "",
    pelanggan: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Memoize filtered data to optimize performance
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Date filter: match exact date or partial match
      const matchTanggal =
        !filters.tanggal || item.tanggal.includes(filters.tanggal);
      
      // Product filter: case-insensitive partial match
      const matchProduk =
        !filters.produk ||
        item.produk.toLowerCase().includes(filters.produk.toLowerCase());
      
      // Customer filter: case-insensitive partial match
      const matchPelanggan =
        !filters.pelanggan ||
        item.nama_pelanggan
          .toLowerCase()
          .includes(filters.pelanggan.toLowerCase());

      return matchTanggal && matchProduk && matchPelanggan;
    });
  }, [data, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      tanggal: "",
      produk: "",
      pelanggan: "",
    });
  };

  const hasActiveFilters =
    filters.tanggal || filters.produk || filters.pelanggan;

  // Separate the header section into a reusable component
  const TableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          ID Transaksi
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Pelanggan
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Produk
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Qty
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Harga
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Tanggal
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Aksi
        </th>
      </tr>
    </thead>
  );

  // Separate the row section into a reusable component
  const TableRow = ({ item }: { item: SalesData }) => (
    <tr key={item.id_transaksi} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {item.id_transaksi}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.nama_pelanggan}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.produk}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.qty}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {formatCurrency(item.harga)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {formatCurrency(item.total_harga)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {formatDate(item.tanggal)}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-60 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(item.id_transaksi)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Data Penjualan
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={filters.tanggal}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="produk"
                    value={filters.produk}
                    onChange={handleFilterChange}
                    placeholder="Cari produk..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pelanggan
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="pelanggan"
                    value={filters.pelanggan}
                    onChange={handleFilterChange}
                    placeholder="Cari pelanggan..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Hapus Filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {hasActiveFilters
                ? "Tidak ada data yang sesuai dengan filter"
                : "Belum ada data penjualan dari n8n. Tambahkan data baru atau upload file terlebih dahulu."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <TableHeader />
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <TableRow key={item.id_transaksi} item={item} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredData.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Menampilkan {filteredData.length} dari {data.length} data
          </p>
        </div>
      )}
    </div>
  );
};
