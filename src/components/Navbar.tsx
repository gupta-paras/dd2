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
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E4DC] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none rounded-lg"
          >
            <div className="relative w-10 h-10 rounded-lg bg-[#1A1917] flex items-center justify-center text-[#FAF8F5] shadow-xs group-hover:bg-[#282724] transition-colors border border-stone-800">
              <span className="font-serif font-medium text-base tracking-widest">DD</span>
              {/* Subtle dual cultural pin: Delft blue & Saffron brass corner dots */}
              <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#1D3557]/80" />
              <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#C07C27]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-[#1A1917]">
                  {config.restaurant.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase font-semibold text-[#C07C27] bg-[#C07C27]/10 px-1.5 py-0.5 rounded border border-[#C07C27]/20">
                  AMS × DEL
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium tracking-wider uppercase">
                {isNl ? config.restaurant.cuisine_label_nl : config.restaurant.cuisine_label}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-stone-600">
            <a href="#menu" className="hover:text-stone-900 transition-colors py-1 border-b border-transparent hover:border-stone-900">
              {t('Our menu', 'Ons menu')}
            </a>
            <a href="#about" className="hover:text-stone-900 transition-colors py-1 border-b border-transparent hover:border-stone-900">
              {t('About me', 'Over mij')}
            </a>
            <a href="#ordering" className="hover:text-stone-900 transition-colors py-1 border-b border-transparent hover:border-stone-900">
              {t('How to order', 'Bestellen')}
            </a>
          </nav>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* EN / NL Language Switcher */}
            <div className="inline-flex items-center rounded-full bg-[#F4F1EB] p-0.5 border border-[#E8E4DC] text-xs font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold border border-stone-200/60'
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
                    ? 'bg-white text-stone-900 shadow-2xs font-bold border border-stone-200/60'
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              title={t('Kitchen Management Portal', 'Keukenbeheerportaal')}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden lg:inline">{t('Kitchen', 'Keuken')}</span> Admin
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 bg-[#1A1917] hover:bg-[#282724] active:scale-[0.98] text-[#FAF8F5] px-3.5 sm:px-4 py-2.5 rounded-full font-medium text-xs tracking-wide shadow-xs transition-all cursor-pointer border border-stone-800"
              aria-label={`${t('Open basket', 'Open winkelmandje')} - Open shopping cart`}
            >
              <div className="relative">
                <ShoppingBag className="w-3.5 h-3.5 text-[#E29D38]" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C07C27] text-white text-[9px] font-bold h-3.5 min-w-3.5 px-1 rounded-full flex items-center justify-center shadow-xs">
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
