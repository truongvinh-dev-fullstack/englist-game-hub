"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export interface ExitConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
}: ExitConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exit-dialog-title"
      aria-describedby="exit-dialog-desc"
    >
      <div className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-xl border border-slate-200 space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>

        <div>
          <h2 id="exit-dialog-title" className="text-lg font-bold text-slate-900">
            Dừng lượt chơi hiện tại?
          </h2>
          <p id="exit-dialog-desc" className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">
            Tiến độ của các câu chưa nộp trong phiên này sẽ không được lưu nếu bạn thoát ngay bây giờ.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-touch rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary transition-colors"
          >
            Tiếp tục chơi
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full min-h-touch rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-slate-400 transition-colors"
          >
            Xác nhận thoát
          </button>
        </div>
      </div>
    </div>
  );
}

