'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Dish, CartItem } from '@/types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  totalCount: number;
  totalAmount: number;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addItem: (dish: Dish) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (dishId: string) => number;
}

const CART_STORAGE_KEY = 'desi_dutch_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { success } = useToast();

  // Load from localStorage on client mount asynchronously to avoid cascading renders
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch {
        // Ignore localStorage parse errors
      } finally {
        setIsInitialized(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when items update (only after mounted)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage quota errors
    }
  }, [items, isInitialized]);

  const addItem = useCallback((dish: Dish) => {
    if (!dish.is_available) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.dish.dish_id === dish.dish_id);
      if (existing) {
        return prev.map((item) =>
          item.dish.dish_id === dish.dish_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });

    success('Added to order', `${dish.name} added to your basket.`);
  }, [success]);

  const updateQuantity = useCallback((dishId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.dish.dish_id !== dishId);
      }
      return prev.map((item) =>
        item.dish.dish_id === dishId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((dishId: string) => {
    setItems((prev) => prev.filter((item) => item.dish.dish_id !== dishId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const getItemQuantity = useCallback(
    (dishId: string): number => {
      const item = items.find((i) => i.dish.dish_id === dishId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        isCheckoutOpen,
        totalCount,
        totalAmount,
        setIsCartOpen,
        setIsCheckoutOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
