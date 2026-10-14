import React from 'react';
import { AlertCircle, CheckCircle, ShieldCheck, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  details?: { label: string; value: string }[];
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  iconType?: 'mail' | 'calendar' | 'sheets' | 'drive' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  details = [],
  confirmText = 'Confirm & Proceed',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">Google Workspace User Permission</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

          {details.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200/60">
              {details.map((d, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-200/40 last:border-0">
                  <span className="font-medium text-slate-500">{d.label}:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Only permitted files, events, and reports will be created on your Google account.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
