import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';

type DownloadFormat = 'csv' | 'xlsx';

interface DataDownloadProps {
  onDownload: (format: DownloadFormat) => void;
  downloadingFormat: DownloadFormat | null;
}

export const DataDownload = ({ onDownload, downloadingFormat }: DataDownloadProps) => {
  const isDownloading = (format: DownloadFormat) => downloadingFormat === format;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Download Data Penjualan (n8n)</h3>
          <p className="text-sm text-gray-600 mt-1">
            Unduh data penjualan terbaru langsung dari workflow n8n dalam format CSV atau XLSX.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onDownload('xlsx')}
            disabled={isDownloading('xlsx')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading('xlsx') ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>{isDownloading('xlsx') ? 'Mengunduh XLSX...' : 'Download XLSX'}</span>
          </button>
          <button
            type="button"
            onClick={() => onDownload('csv')}
            disabled={isDownloading('csv')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading('csv') ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isDownloading('csv') ? 'Mengunduh CSV...' : 'Download CSV'}</span>
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="font-medium text-gray-800 mb-1">Format XLSX</p>
          <p>Gunakan untuk dibuka di Microsoft Excel atau Google Sheets dengan format tabel rapi.</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="font-medium text-gray-800 mb-1">Format CSV</p>
          <p>Cocok untuk kebutuhan import sistem lain atau pemrosesan lebih lanjut.</p>
        </div>
      </div>
    </div>
  );
};
