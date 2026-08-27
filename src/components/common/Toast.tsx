import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastState } from '../../hooks/useAttendance';

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="toast-box">
        <div className="toast-message">
          {toast.type === 'error' ? (
            <AlertCircle size={18} color="#f43f5e" />
          ) : toast.type === 'info' ? (
            <Info size={18} color="#38bdf8" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span>{toast.message}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {toast.undoAction && (
            <button className="toast-undo-btn" onClick={toast.undoAction}>
              Undo
            </button>
          )}
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', display: 'flex', padding: '4px' }}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
