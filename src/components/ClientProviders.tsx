'use client';

import React from 'react';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { ConfigProvider } from '@/context/ConfigContext';
import { LanguageProvider } from '@/context/LanguageContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
      <LanguageProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </LanguageProvider>
    </ConfigProvider>
  );
}
