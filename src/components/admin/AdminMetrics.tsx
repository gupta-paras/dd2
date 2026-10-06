'use client';

import React from 'react';
import { Dish } from '@/types';
import { Utensils, Sparkles, CheckCircle2, Clock, Euro } from 'lucide-react';

interface AdminMetricsProps {
  dishes: Dish[];
}

export function AdminMetrics({ dishes }: AdminMetricsProps) {
  const totalDishes = dishes.length;
  const dailySpecialsCount = dishes.filter((d) => d.daily_special).length;
  const inStockCount = dishes.filter((d) => d.is_available && !d.is_coming_soon).length;
  const comingSoonCount = dishes.filter((d) => d.is_coming_soon || d.price === 0).length;
  const pricedDishes = dishes.filter((d) => !d.is_coming_soon && d.price > 0);
  const avgPrice =
    pricedDishes.length > 0
      ? pricedDishes.reduce((acc, d) => acc + d.price, 0) / pricedDishes.length
      : 0;

  const metrics = [
    {
      label: 'Total Dishes',
      value: totalDishes,
      icon: Utensils,
      color: 'text-stone-900',
      bg: 'bg-stone-100',
      description: 'Active menu entries',
    },
    {
      label: 'Daily Specials',
      value: dailySpecialsCount,
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description: 'Featured daily items',
    },
    {
      label: 'In Stock',
      value: inStockCount,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      description: 'Ready to order',
    },
    {
      label: 'Coming Soon',
      value: comingSoonCount,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Preview items',
    },
    {
      label: 'Average Price',
      value: `€${avgPrice.toFixed(2)}`,
      icon: Euro,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: 'Active catalog items',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {metric.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${metric.bg} ${metric.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {metric.value}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
