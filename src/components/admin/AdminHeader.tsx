'use client';

import React from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import { Plus, ArrowLeft, ChefHat } from 'lucide-react';

interface AdminHeaderProps {
  onAddNewDish: () => void;
}

export function AdminHeader({ onAddNewDish }: AdminHeaderProps) {
  const { config } = useConfig();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E7E5E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand & Admin Badge */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 transition-colors shadow-2xs"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4 text-stone-500" />
              <span>Back to Storefront</span>
            </Link>

            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-sm">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                    Kitchen Admin Dashboard
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live SQLite
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {config.restaurant.name} Menu &amp; Inventory Operations
                </p>
              </div>
            </div>
          </div>

          {/* Right: Add Dish CTA & Logout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAddNewDish}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/admin/login';
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-200 transition-colors shadow-2xs cursor-pointer"
              title="Sign Out"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
