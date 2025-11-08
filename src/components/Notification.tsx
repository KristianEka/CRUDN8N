import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Notification = ({ type, message, onClose, duration = 5000 }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md ${
          type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
        ) : (
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
        )}
        <p
          className={`text-sm font-medium flex-1 ${
            type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className={`${
            type === 'success' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
          } transition-colors`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
