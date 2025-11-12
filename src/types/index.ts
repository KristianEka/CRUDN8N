// Sales data interface representing a single sales record
export interface SalesData {
  id_transaksi: string;      // Transaction ID
  nama_pelanggan: string;    // Customer name
  produk: string;            // Product name
  qty: number;               // Quantity
  harga: number;             // Price per unit
  total_harga: number;       // Total price (qty * harga)
  tanggal: string;           // Date in DD-MM-YYYY format
}

// Interface for filter state management
export interface FilterState {
  tanggal?: string;          // Date filter
  produk?: string;           // Product filter
  pelanggan?: string;        // Customer filter
}

// Standard API response interface
export interface ApiResponse {
  success: boolean;          // Whether the request was successful
  message: string;           // Response message
  data?: SalesData[];        // Optional sales data array
}

// Interface for sales form props
export interface SalesFormProps {
  onSubmit: (data: Omit<SalesData, 'id_transaksi'>) => void;
  onClose: () => void;
  initialData?: SalesData;
  isEdit?: boolean;
}

// Interface for sales table props
export interface SalesTableProps {
  data: SalesData[];
  onEdit: (item: SalesData) => void;
 onDelete: (id: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

// Notification interface for UI feedback
export interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}
