'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Search, X, Sparkles, CheckCircle2, RotateCcw, SlidersHorizontal, Clock } from 'lucide-react';

export const CATEGORIES_CONFIG = [
  { id: 'All', en: 'Everything', nl: 'Alles' },
  { id: 'Curries', en: 'Curries', nl: "Curry's" },
  { id: 'Biryani', en: 'Biryani', nl: 'Biryani' },
  { id: 'Snacks', en: 'Snacks', nl: 'Snacks' },
  { id: 'Breads', en: 'Breads', nl: 'Broden' },
  { id: 'Rice', en: 'Rice', nl: 'Rijst' },
  { id: 'Drinks', en: 'Drinks', nl: 'Dranken' },
  { id: 'South Indian', en: 'South Indian', nl: 'Zuid-Indiaas' },
  { id: 'Desserts', en: 'Desserts', nl: 'Nagerechten' },
  { id: 'Vegetarian', en: 'Vegetarian', nl: 'Vegetarisch' },
] as const;

interface FilterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeTag: string;
  onTagChange: (tag: string) => void;
  dailySpecialOnly: boolean;
  onDailySpecialChange: (val: boolean) => void;
  inStockOnly: boolean;
  onInStockChange: (val: boolean) => void;
  comingSoonOnly?: boolean;
  onComingSoonChange?: (val: boolean) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterToolbar({
  search,
  onSearchChange,
  activeTag,
  onTagChange,
  dailySpecialOnly,
  onDailySpecialChange,
  inStockOnly,
  onInStockChange,
  comingSoonOnly = false,
  onComingSoonChange,
  onResetFilters,
  totalCount,
  filteredCount,
}: FilterToolbarProps) {
  const { language, t } = useLanguage();
  const isNl = language === 'nl';

  const isAnyFilterActive =
    search.trim().length > 0 ||
    activeTag !== 'All' ||
    dailySpecialOnly ||
    inStockOnly ||
    comingSoonOnly;

  return (
    <div className="w-full space-y-4">
      {/* Top Bar: Search Input & Toggle Switches */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t(
              'Search dishes (e.g. Butter chicken, Biryani, Dosa)...',
              'Zoek gerechten (bijv. Butter chicken, Biryani, Dosa)...'
            )}
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#FAF8F5]/80 border border-stone-200 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 shadow-2xs transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggles and Reset */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Daily Specials Toggle */}
          <button
            type="button"
            onClick={() => onDailySpecialChange(!dailySpecialOnly)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer border select-none ${
              dailySpecialOnly
                ? 'bg-[#1A1917] text-white border-[#1A1917] shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200/90 hover:border-stone-400 hover:bg-[#FAF8F5]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${dailySpecialOnly ? 'text-[#C07C27]' : 'text-[#C07C27]'}`} />
            <span>{t('Daily Specials Only', 'Favorieten uit de keuken')}</span>
          </button>

          {/* In Stock Only Toggle */}
          <button
            type="button"
            onClick={() => onInStockChange(!inStockOnly)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer border select-none ${
              inStockOnly
                ? 'bg-[#1D3557] text-white border-[#1D3557] shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200/90 hover:border-stone-400 hover:bg-[#FAF8F5]'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-white' : 'text-emerald-700'}`} />
            <span>{t('In Stock Only', 'Op voorraad')}</span>
          </button>

          {/* Coming Soon Toggle */}
          {onComingSoonChange && (
            <button
              type="button"
              onClick={() => onComingSoonChange(!comingSoonOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer border select-none ${
                comingSoonOnly
                  ? 'bg-stone-800 text-white border-stone-800 shadow-2xs'
                  : 'bg-white text-stone-700 border-stone-200/90 hover:border-stone-400 hover:bg-[#FAF8F5]'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${comingSoonOnly ? 'text-white' : 'text-stone-500'}`} />
              <span>{t('Coming Soon', 'Binnenkort')}</span>
            </button>
          )}

          {/* Reset Filters Button */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200/80 transition-all cursor-pointer"
              title={t('Reset all filters', 'Filters resetten')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('Reset', 'Resetten')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills Row */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-stone-200/60">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-medium text-stone-400 mr-1 hidden sm:inline flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            {t('Category:', 'Categorie:')}
          </span>
          {CATEGORIES_CONFIG.map((cat) => {
            const isActive = activeTag.toLowerCase() === cat.id.toLowerCase();
            const label = isNl ? cat.nl : cat.en;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onTagChange(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#1A1917] text-white shadow-2xs'
                    : 'bg-white/80 text-stone-600 border border-[#EAE6DF] hover:border-stone-400 hover:text-stone-900 hover:bg-[#FAF8F5]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Counter indicator */}
        <div className="text-xs text-stone-500 whitespace-nowrap shrink-0">
          {t('Showing', 'Getoond')}{' '}
          <span className="font-semibold text-stone-900">{filteredCount}</span> {t('of', 'van')}{' '}
          {totalCount}
        </div>
      </div>
    </div>
  );
}
