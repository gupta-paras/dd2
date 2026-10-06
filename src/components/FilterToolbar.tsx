'use client';

import React from 'react';
import { Search, X, Sparkles, CheckCircle2, RotateCcw, SlidersHorizontal } from 'lucide-react';

export const TAG_OPTIONS = [
  'All',
  'Main',
  'Snack',
  'Dessert',
  'Fusion',
  'Spicy',
  'Vegetarian',
  'Halal',
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
  onResetFilters,
  totalCount,
  filteredCount,
}: FilterToolbarProps) {
  const isAnyFilterActive =
    search.trim().length > 0 ||
    activeTag !== 'All' ||
    dailySpecialOnly ||
    inStockOnly;

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
            placeholder="Search dishes by name (e.g., Bitterballen, Kapsalon, Wafel)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-stone-200 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-2xs transition-all"
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
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Chef's Daily Specials Toggle (OR Filter) */}
          <button
            type="button"
            onClick={() => onDailySpecialChange(!dailySpecialOnly)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border select-none ${
              dailySpecialOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${dailySpecialOnly ? 'text-white' : 'text-amber-500'}`} />
            <span>Daily Specials Only</span>
          </button>

          {/* In Stock Only Toggle (AND Filter) */}
          <button
            type="button"
            onClick={() => onInStockChange(!inStockOnly)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border select-none ${
              inStockOnly
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-white' : 'text-emerald-600'}`} />
            <span>In Stock Only</span>
          </button>

          {/* Reset Filters Button */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Tag Filter Pills Row */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-stone-200/60">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-medium text-stone-400 mr-1 hidden sm:inline flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Category:
          </span>
          {TAG_OPTIONS.map((tag) => {
            const isActive = activeTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(tag)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Counter indicator */}
        <div className="text-xs text-stone-500 whitespace-nowrap shrink-0">
          Showing <span className="font-semibold text-stone-900">{filteredCount}</span> of {totalCount}
        </div>
      </div>
    </div>
  );
}
