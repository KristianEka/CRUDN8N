import { SalesData } from '../types';

export const generateTemplateXLSX = () => {
  const headers = 'ID Transaksi\tNama Pelanggan\tProduk\tQty\tHarga\tTotal Harga\tTanggal\n';
  const sampleData = [
    '1001\tBudi Santoso\tProduk A\t2\t100\t200\t11-01-25',
    '1002\tSiti Aminah\tProduk B\t1\t150\t150\t11-02-25',
    '1003\tAndi Wijaya\tProduk C\t5\t75\t375\t11-03-25',
  ].join('\n');

  const xlsxContent = headers + sampleData;
  const blob = new Blob([xlsxContent], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'template_penjualan.xlsx');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  // Handle different date formats
  let date: Date;
  
  // Check if it's in DD-MM-YY format (from API)
  if (/^\d{2}-\d{2}-\d{2}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-').map(Number);
    const fullYear = year + 2000; // Assuming 20xx for 2-digit years
    date = new Date(fullYear, month - 1, day); // month is 0-indexed
  } else {
    // For other formats, try to parse directly
    date = new Date(dateString);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original string if date is invalid
  }
  
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
