'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { totalCount, totalAmount, setIsCartOpen } = useCart();
  const { config } = useConfig();
  const { language, setLanguage, t } = useLanguage();

  const isNl = language === 'nl';

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
              <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                {config.restaurant.name}
              </span>
              <span className="text-xs text-stone-500 font-medium tracking-wide">
                {isNl ? config.restaurant.cuisine_label_nl : config.restaurant.cuisine_label}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <a href="#menu" className="hover:text-amber-700 transition-colors">
              {t('Our menu', 'Ons menu')}
            </a>
            <a href="#about" className="hover:text-amber-700 transition-colors">
              {t('About me', 'Over mij')}
            </a>
            <a href="#ordering" className="hover:text-amber-700 transition-colors">
              {t('How to order', 'Bestellen')}
            </a>
          </nav>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* EN / NL Language Switcher */}
            <div className="inline-flex items-center rounded-full bg-stone-100 p-0.5 border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Switch to English"
                aria-label="Switch language to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('nl')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'nl'
                    ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Schakel naar Nederlands"
                aria-label="Switch language to Dutch"
              >
                NL
              </button>
            </div>

            {/* Admin Dashboard Link */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 px-2.5 sm:px-3 py-2 rounded-lg hover:bg-stone-100/80 transition-colors border border-transparent hover:border-stone-200"
              title={t('Kitchen Management Portal', 'Keukenbeheerportaal')}
            >
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span className="hidden md:inline">{t('Kitchen', 'Keuken')}</span> Admin
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white px-3.5 sm:px-4 py-2.5 rounded-full font-medium text-sm shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
              aria-label={t('Open basket', 'Open winkelmandje')}
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
                  <span>{t('Basket', 'Mandje')}</span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
