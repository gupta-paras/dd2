'use client';

import React from 'react';
import { Dish } from '@/types';
import { DishCard } from './DishCard';
import { Utensils, RotateCcw } from 'lucide-react';

interface DishGridProps {
  dishes: Dish[];
  loading?: boolean;
  onResetFilters?: () => void;
}

export function DishGrid({ dishes, loading, onResetFilters }: DishGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse flex flex-col"
          >
            <div className="aspect-[16/10] bg-stone-200" />
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-stone-200 rounded" />
                <div className="h-6 w-3/4 bg-stone-200 rounded" />
                <div className="h-3 w-full bg-stone-100 rounded" />
                <div className="h-3 w-2/3 bg-stone-100 rounded" />
              </div>
              <div className="pt-4 flex items-center justify-between">
                <div className="h-6 w-16 bg-stone-200 rounded" />
                <div className="h-8 w-20 bg-stone-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center rounded-3xl border border-dashed border-stone-300 bg-white/60">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
          <Utensils className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-1">
          No matching dishes found
        </h3>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
          We couldn&apos;t find any dishes matching your current search or dietary filters. Try broadening your criteria.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {dishes.map((dish) => (
        <DishCard key={dish.dish_id} dish={dish} />
      ))}
    </div>
  );
}
