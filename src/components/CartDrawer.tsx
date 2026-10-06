'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Bike } from 'lucide-react';

export function CartDrawer() {
  const { config } = useConfig();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeItem,
    totalCount,
    totalAmount,
  } = useCart();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeThreshold = config.delivery.free_threshold || 25.0;
  const standardFee = config.delivery.fee || 2.5;

  const remainingForFreeDelivery = Math.max(0, freeThreshold - totalAmount);
  const deliveryProgressPercent = Math.min(
    100,
    (totalAmount / freeThreshold) * 100
  );
  const deliveryFee = totalAmount >= freeThreshold || totalAmount === 0 ? 0 : standardFee;
  const finalTotal = totalAmount + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 leading-tight">
                  Your Order Basket
                </h2>
                <p className="text-xs text-stone-500">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Progress Bar */}
          {items.length > 0 && (
            <div className="bg-amber-50/70 border-b border-amber-200/50 px-5 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1.5">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <Bike className="w-4 h-4 text-amber-600" />
                  {remainingForFreeDelivery > 0
                    ? `Add €${remainingForFreeDelivery.toFixed(2)} more for Free Delivery`
                    : '🎉 You have unlocked Free Amsterdam Delivery!'}
                </span>
                <span className="text-amber-800 font-bold">
                  {Math.round(deliveryProgressPercent)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${deliveryProgressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-300">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-800">
                    Your basket is feeling empty
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs">
                    Explore our sizzling Dutch classics reimagined with aromatic Delhi spice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
                >
                  Explore Dishes
                </button>
              </div>
            ) : (
              items.map(({ dish, quantity }) => (
                <div
                  key={dish.dish_id}
                  className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs flex gap-3.5 items-center"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    <Image
                      src={dish.photo_url}
                      alt={dish.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-bold text-stone-900 truncate">
                        {dish.name}
                      </h4>
                      <button
                        onClick={() => removeItem(dish.dish_id)}
                        className="text-stone-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-stone-800">
                        €{dish.price.toFixed(2)}
                      </span>
                      {dish.daily_special && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                          Special
                        </span>
                      )}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="inline-flex items-center gap-2 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(dish.dish_id, quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold min-w-4 text-center text-stone-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(dish.dish_id, quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900">
                        €{(dish.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-white space-y-3.5">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    €{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Amsterdam Delivery</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `€${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-100 text-sm font-extrabold text-stone-900">
                  <span>Total (incl. BTW)</span>
                  <span className="text-base text-stone-900">
                    €{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <span className="text-amber-200">•</span>
                <span>€{finalTotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
