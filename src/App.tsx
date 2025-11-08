import { useState, useEffect, useCallback } from 'react';
import { Plus, Upload as UploadIcon } from 'lucide-react';
import { Header } from './components/Header';
import { SalesForm } from './components/SalesForm';
import { SalesTable } from './components/SalesTable';
import { FileUpload } from './components/FileUpload';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { TemplateDownload } from './components/TemplateDownload';
import { DataDownload } from './components/DataDownload';
import { Notification } from './components/Notification';
import { SalesData } from './types';
import { api } from './utils/api';

function App() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<'csv' | 'xlsx' | null>(null);

  const loadSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchSalesData();
      setSalesData(data);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Gagal memuat data penjualan. Pastikan koneksi ke n8n webhook berfungsi.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  const handleAddData = async (data: Omit<SalesData, 'id_transaksi'>) => {
    try {
      await api.createSalesData(data);
      setNotification({
        type: 'success',
        message: 'Data penjualan berhasil ditambahkan!',
      });
      setShowForm(false);
      loadSalesData();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal menambah data penjualan',
      });
    }
  };

  const handleEditData = async (data: Omit<SalesData, 'id_transaksi'>) => {
    if (!editingItem) return;

    try {
      await api.updateSalesData(editingItem.id_transaksi, data);
      setNotification({
        type: 'success',
        message: 'Data penjualan berhasil diupdate!',
      });
      setShowForm(false);
      setEditingItem(null);
      loadSalesData();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal mengupdate data penjualan',
      });
    }
  };

  const handleDeleteData = async () => {
    if (!deletingId) return;

    try {
      await api.deleteSalesData(deletingId);
      setNotification({
        type: 'success',
        message: 'Data penjualan berhasil dihapus!',
      });
      setShowDeleteConfirm(false);
      setDeletingId(null);
      loadSalesData();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal menghapus data penjualan',
      });
    }
  };

  const handleUploadFile = async (file: File) => {
    try {
      await api.uploadFile(file);
      setNotification({
        type: 'success',
        message: 'File berhasil diupload dan data telah diproses!',
      });
      setShowUpload(false);
      loadSalesData();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal mengupload file',
      });
      throw error;
    }
  };

  const handleDownloadFile = async (format: 'csv' | 'xlsx') => {
    setDownloadingFormat(format);
    try {
      const { blob, filename } = await api.downloadFile(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotification({
        type: 'success',
        message: `File ${format.toUpperCase()} berhasil diunduh!`,
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : `Gagal mengunduh file ${format.toUpperCase()}`,
      });
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleEdit = (item: SalesData) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            <span>Tambah Data Baru</span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
          >
            <UploadIcon size={20} />
            <span>Upload File CSV/XLSX</span>
          </button>
        </div>

        <div className="mb-6">
          <TemplateDownload />
        </div>

        <div className="mb-6">
          <DataDownload
            onDownload={handleDownloadFile}
            downloadingFormat={downloadingFormat}
          />
        </div>

        <SalesTable
          data={salesData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadSalesData}
          loading={loading}
        />

      </main>

      {showForm && (
        <SalesForm
          onSubmit={editingItem ? handleEditData : handleAddData}
          onClose={handleCloseForm}
          initialData={editingItem || undefined}
          isEdit={!!editingItem}
        />
      )}

      {showUpload && (
        <FileUpload
          onUpload={handleUploadFile}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showDeleteConfirm && deletingId && (
        <DeleteConfirmation
          onConfirm={handleDeleteData}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingId(null);
          }}
          itemName={deletingId}
        />
      )}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;
