'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dish } from '@/types';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  dish: Dish | null;
  onClose: () => void;
  onConfirm: (dishId: string) => Promise<void>;
}

export function DeleteConfirmModal({
  isOpen,
  dish,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !dish) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(dish.dish_id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900">
              Delete &quot;{dish.name}&quot;?
            </h3>
            <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
              Are you sure you want to permanently remove this dish from the Desi Dutch menu? This action cannot be reversed.
            </p>
          </div>

          {/* Dish preview pill */}
          <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-left">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-200 shrink-0">
              <Image
                src={dish.photo_url}
                alt={dish.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-900 truncate">
                {dish.name}
              </p>
              <p className="text-xs font-semibold text-amber-700">
                €{dish.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Dish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
