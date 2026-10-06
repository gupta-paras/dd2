'use client';

import React from 'react';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { ConfigProvider } from '@/context/ConfigContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </ConfigProvider>
  );
}
