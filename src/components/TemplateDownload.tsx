import { Download, FileSpreadsheet } from 'lucide-react';
import { generateTemplateXLSX } from '../utils/fileGenerator';

export const TemplateDownload = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Template Import XLSX</h3>
        <p className="text-sm text-gray-600 mt-1">
          Template berisi kolom: ID Transaksi, Nama Pelanggan, Produk, Qty, Harga, Total Harga, dan Tanggal.
        </p>
      </div>
      <button
        onClick={generateTemplateXLSX}
        className="flex items-center justify-center gap-3 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
      >
        <FileSpreadsheet size={20} />
        <span>Download Template XLSX</span>
        <Download size={18} />
      </button>
    </div>
  );
};
