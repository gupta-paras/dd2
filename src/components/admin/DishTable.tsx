'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dish } from '@/types';
import {
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  Ban,
  Search,
  Clock,
} from 'lucide-react';

interface DishTableProps {
  dishes: Dish[];
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  onToggleSpecial: (dish: Dish) => Promise<void>;
  onToggleAvailability: (dish: Dish) => Promise<void>;
  onToggleComingSoon?: (dish: Dish) => Promise<void>;
}

export function DishTable({
  dishes,
  onEdit,
  onDelete,
  onToggleSpecial,
  onToggleAvailability,
  onToggleComingSoon,
}: DishTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'in_stock' | 'out_of_stock' | 'special' | 'coming_soon'
  >('all');
  const [updatingDishIds, setUpdatingDishIds] = useState<Record<string, boolean>>({});

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      dish.name.toLowerCase().includes(search.toLowerCase()) ||
      (dish.category && dish.category.toLowerCase().includes(search.toLowerCase())) ||
      dish.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      dish.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'in_stock') return dish.is_available && !dish.is_coming_soon;
    if (statusFilter === 'out_of_stock') return !dish.is_available;
    if (statusFilter === 'special') return dish.daily_special;
    if (statusFilter === 'coming_soon') return dish.is_coming_soon || dish.price === 0;

    return true;
  });

  const handleToggleSpecialClick = async (dish: Dish) => {
    const key = `${dish.dish_id}_special`;
    if (updatingDishIds[key]) return;
    try {
      setUpdatingDishIds((prev) => ({ ...prev, [key]: true }));
      await onToggleSpecial(dish);
    } finally {
      setUpdatingDishIds((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleToggleAvailabilityClick = async (dish: Dish) => {
    const key = `${dish.dish_id}_stock`;
    if (updatingDishIds[key]) return;
    try {
      setUpdatingDishIds((prev) => ({ ...prev, [key]: true }));
      await onToggleAvailability(dish);
    } finally {
      setUpdatingDishIds((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleToggleComingSoonClick = async (dish: Dish) => {
    if (!onToggleComingSoon) return;
    const key = `${dish.dish_id}_coming_soon`;
    if (updatingDishIds[key]) return;
    try {
      setUpdatingDishIds((prev) => ({ ...prev, [key]: true }));
      await onToggleComingSoon(dish);
    } finally {
      setUpdatingDishIds((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute inset-y-0 left-3.5 my-auto text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish by name, category, tag, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-stone-400 mr-1 hidden md:inline">
            Status:
          </span>
          {(
            [
              { id: 'all', label: 'All Dishes' },
              { id: 'in_stock', label: 'In Stock' },
              { id: 'out_of_stock', label: 'Out of Stock' },
              { id: 'special', label: 'Daily Specials' },
              { id: 'coming_soon', label: 'Coming Soon' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === filter.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Dish Details</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4 text-center">Daily Special</th>
              <th className="py-3.5 px-4 text-center">Coming Soon</th>
              <th className="py-3.5 px-4 text-center">Availability</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {filteredDishes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-400">
                  <p className="text-sm font-semibold text-stone-600">
                    No dishes found
                  </p>
                  <p className="text-xs mt-1">
                    Try adjusting your search query or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              filteredDishes.map((dish) => {
                const isSpecialLoading = updatingDishIds[`${dish.dish_id}_special`];
                const isStockLoading = updatingDishIds[`${dish.dish_id}_stock`];
                const isComingSoonLoading = updatingDishIds[`${dish.dish_id}_coming_soon`];
                const isComingSoon = Boolean(dish.is_coming_soon) || dish.price === 0;

                return (
                  <tr
                    key={dish.dish_id}
                    className="hover:bg-amber-50/20 transition-colors group"
                  >
                    {/* Dish Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          <Image
                            src={dish.photo_url}
                            alt={dish.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <h4 className="font-bold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                            {dish.name}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {dish.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                        {dish.category || 'Curries'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-stone-900">
                      {isComingSoon ? (
                        <span className="text-purple-700 text-xs font-bold">
                          Coming soon
                        </span>
                      ) : (
                        `€${dish.price.toFixed(2)}`
                      )}
                    </td>

                    {/* 1-Click Inline Daily Special Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSpecialClick(dish)}
                        disabled={isSpecialLoading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          dish.daily_special
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            : 'bg-stone-100 text-stone-400 hover:bg-stone-200 border border-transparent'
                        }`}
                        title="Click to toggle Daily Special"
                      >
                        {isSpecialLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                        ) : (
                          <Sparkles
                            className={`w-3.5 h-3.5 ${
                              dish.daily_special ? 'text-amber-600 fill-amber-500' : 'text-stone-400'
                            }`}
                          />
                        )}
                        <span>{dish.daily_special ? 'Special' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* 1-Click Inline Coming Soon Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleComingSoonClick(dish)}
                        disabled={isComingSoonLoading || !onToggleComingSoon}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isComingSoon
                            ? 'bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200'
                            : 'bg-stone-100 text-stone-400 hover:bg-stone-200 border border-transparent'
                        }`}
                        title="Click to toggle Coming Soon"
                      >
                        {isComingSoonLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                        ) : (
                          <Clock
                            className={`w-3.5 h-3.5 ${
                              isComingSoon ? 'text-purple-600' : 'text-stone-400'
                            }`}
                          />
                        )}
                        <span>{isComingSoon ? 'Coming Soon' : 'Active'}</span>
                      </button>
                    </td>

                    {/* 1-Click Inline Availability Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailabilityClick(dish)}
                        disabled={isStockLoading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          dish.is_available
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                        }`}
                        title="Click to toggle Stock Status"
                      >
                        {isStockLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-stone-600/30 border-t-stone-600 rounded-full animate-spin" />
                        ) : dish.is_available ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{dish.is_available ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(dish)}
                          className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(dish)}
                          className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden divide-y divide-stone-100">
        {filteredDishes.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <p className="text-sm font-semibold text-stone-600">No dishes found</p>
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const isComingSoon = Boolean(dish.is_coming_soon) || dish.price === 0;
            return (
              <div key={dish.dish_id} className="p-4 space-y-3">
                <div className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <Image
                      src={dish.photo_url}
                      alt={dish.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 truncate">
                      {dish.name}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {dish.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {dish.category || 'Curries'}
                      </span>
                      <p className="text-sm font-bold text-stone-900">
                        {isComingSoon ? (
                          <span className="text-purple-700 text-xs font-bold">
                            Coming soon
                          </span>
                        ) : (
                          `€${dish.price.toFixed(2)}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Toggles and Actions row */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Daily Special Toggle */}
                    <button
                      onClick={() => handleToggleSpecialClick(dish)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                        dish.daily_special
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{dish.daily_special ? 'Special' : 'Regular'}</span>
                    </button>

                    {/* Stock Toggle */}
                    <button
                      onClick={() => handleToggleAvailabilityClick(dish)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                        dish.is_available
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}
                    >
                      {dish.is_available ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Ban className="w-3 h-3 text-rose-600" />
                      )}
                      <span>{dish.is_available ? 'In Stock' : 'Sold Out'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(dish)}
                      className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(dish)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
