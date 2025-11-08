import { useState } from 'react';
import { X } from 'lucide-react';
import { SalesData } from '../types';

interface SalesFormProps {
  onSubmit: (data: Omit<SalesData, 'id_transaksi'>) => void;
  onClose: () => void;
  initialData?: SalesData;
  isEdit?: boolean;
}

export const SalesForm = ({ onSubmit, onClose, initialData, isEdit = false }: SalesFormProps) => {
  const [formData, setFormData] = useState({
    nama_pelanggan: initialData?.nama_pelanggan || '',
    produk: initialData?.produk || '',
    qty: initialData?.qty || 0,
    harga: initialData?.harga || 0,
    tanggal: initialData?.tanggal || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateTotal = () => {
    return formData.qty * formData.harga;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_pelanggan.trim()) {
      newErrors.nama_pelanggan = 'Nama pelanggan wajib diisi';
    }
    if (!formData.produk.trim()) {
      newErrors.produk = 'Produk wajib diisi';
    }
    if (formData.qty <= 0) {
      newErrors.qty = 'Qty harus lebih dari 0';
    }
    if (formData.harga <= 0) {
      newErrors.harga = 'Harga harus lebih dari 0';
    }
    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        ...formData,
        total_harga: calculateTotal(),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'qty' || name === 'harga' ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Data Penjualan' : 'Tambah Data Penjualan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pelanggan *
            </label>
            <input
              type="text"
              name="nama_pelanggan"
              value={formData.nama_pelanggan}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.nama_pelanggan ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama pelanggan"
            />
            {errors.nama_pelanggan && (
              <p className="text-red-500 text-xs mt-1">{errors.nama_pelanggan}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produk *
            </label>
            <input
              type="text"
              name="produk"
              value={formData.produk}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.produk ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama produk"
            />
            {errors.produk && (
              <p className="text-red-500 text-xs mt-1">{errors.produk}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qty *
              </label>
              <input
                type="number"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.qty ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.qty && (
                <p className="text-red-500 text-xs mt-1">{errors.qty}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga *
              </label>
              <input
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.harga ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.harga && (
                <p className="text-red-500 text-xs mt-1">{errors.harga}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Harga
            </label>
            <input
              type="text"
              value={new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(calculateTotal())}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal *
            </label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.tanggal ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.tanggal && (
              <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Simpan Perubahan' : 'Tambah Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
