import { ShoppingCart, Settings } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Automation Penjualan</h1>
              <p className="text-sm text-blue-100">Sistem Manajemen Data Penjualan dengan n8n</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
            <Settings size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
