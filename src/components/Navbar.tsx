'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

export function Navbar() {
  const { totalCount, totalAmount, setIsCartOpen } = useCart();
  const { config } = useConfig();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E7E5E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity */}
          <Link
            href="/"
            className="group flex items-center gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-orange-900/10 group-hover:scale-105 transition-transform duration-300">
              <span className="font-serif font-black text-xl tracking-tight">DD</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                  {config.restaurant.name}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Western Touch
                </span>
              </div>
              <span className="text-xs text-stone-500 font-medium tracking-wide">
                {config.restaurant.cuisine_label}
              </span>
            </div>
          </Link>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Admin Dashboard Link */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-2 rounded-lg hover:bg-stone-100/80 transition-colors border border-transparent hover:border-stone-200"
              title="Kitchen Management Portal"
            >
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span className="hidden md:inline">Kitchen</span> Admin
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white px-4 py-2.5 rounded-full font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
              aria-label={`Open shopping cart, ${totalCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200 shadow">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-semibold">
                {totalCount > 0 ? (
                  <span>€{totalAmount.toFixed(2)}</span>
                ) : (
                  <span>Order</span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
