'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dish } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Plus, Minus, UtensilsCrossed, Ban, Clock } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { language, t } = useLanguage();
  const quantity = getItemQuantity(dish.dish_id);
  const [imageError, setImageError] = useState(false);

  const isNl = language === 'nl';
  const displayName = isNl && dish.name_nl ? dish.name_nl : dish.name;
  const displayDescription = isNl && dish.description_nl ? dish.description_nl : dish.description;

  const isComingSoon = Boolean(dish.is_coming_soon) || dish.price === 0;

  // Helper to color tags tastefully
  const getTagStyle = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes('spicy')) {
      return 'bg-red-50 text-red-700 border-red-200/80';
    }
    if (lower.includes('veg')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    if (lower.includes('curry') || lower.includes('curries')) {
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    }
    if (lower.includes('biryani')) {
      return 'bg-orange-50 text-orange-800 border-orange-200/80';
    }
    if (lower.includes('dessert') || lower.includes('sweet')) {
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    }
    return 'bg-stone-50 text-stone-600 border-stone-200/80';
  };

  return (
    <article
      className={`group relative flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 ${
        !dish.is_available && !isComingSoon ? 'opacity-85' : ''
      }`}
    >
      {/* 16/10 Framing Food Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        {!imageError && dish.photo_url ? (
          <Image
            src={dish.photo_url}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              !dish.is_available && !isComingSoon ? 'grayscale contrast-75' : ''
            }`}
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-amber-50 text-stone-400 p-4 text-center">
            <UtensilsCrossed className="w-10 h-10 mb-2 text-stone-300" />
            <span className="text-xs font-medium text-stone-500">Desi Dutch Kitchen</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 pointer-events-none">
          {/* Daily Special Ribbon */}
          {dish.daily_special ? (
            <div className="glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-900 border border-amber-200 shadow-sm animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{t('Daily Special', 'Favoriet uit de keuken')}</span>
            </div>
          ) : (
            <span />
          )}

          {/* Status Badge: Coming Soon / In Stock / Sold Out */}
          {isComingSoon ? (
            <div className="glass-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-purple-900 bg-purple-50/90 border border-purple-200 shadow-xs">
              <Clock className="w-3 h-3 text-purple-600" />
              <span>{t('Coming soon', 'Binnenkort')}</span>
            </div>
          ) : dish.is_available ? (
            <div className="glass-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('In Stock', 'Op voorraad')}</span>
            </div>
          ) : (
            <div className="glass-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-stone-600 border border-stone-300 bg-stone-100/95 shadow-xs">
              <Ban className="w-3 h-3 text-stone-500" />
              <span>{t('Sold out', 'Uitverkocht')}</span>
            </div>
          )}
        </div>

        {/* Sold out overlay banner */}
        {!dish.is_available && !isComingSoon && (
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="bg-stone-900/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md shadow-md border border-white/20">
              {t('Sold Out Today', 'Vandaag uitverkocht')}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Tags list */}
          <div className="flex flex-wrap gap-1.5">
            {dish.category && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200 capitalize">
                {dish.category}
              </span>
            )}
            {dish.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md border capitalize ${getTagStyle(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
            {displayName}
          </h3>

          {/* Description */}
          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Bottom Price & Add to Cart row */}
        <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          {/* Price Styling */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              {t('Price', 'Prijs')}
            </span>
            {isComingSoon ? (
              <span className="text-sm font-bold text-purple-700 tracking-tight">
                {t('Coming soon', 'Binnenkort')}
              </span>
            ) : (
              <span className="text-xl font-extrabold text-stone-900 tracking-tight">
                €{dish.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Order / Stepper Action */}
          <div>
            {isComingSoon ? (
              <button
                disabled
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 cursor-not-allowed border border-purple-200"
              >
                {t('Coming soon', 'Binnenkort')}
              </button>
            ) : !dish.is_available ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
              >
                {t('Unavailable', 'Niet beschikbaar')}
              </button>
            ) : quantity > 0 ? (
              /* Inline Quantity Stepper */
              <div className="inline-flex items-center gap-2 bg-stone-900 text-white rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => updateQuantity(dish.dish_id, quantity - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors active:scale-95 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold min-w-5 text-center text-white select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(dish.dish_id, quantity + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors active:scale-95 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Add to Cart button */
              <button
                type="button"
                onClick={() => addItem(dish)}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-xs hover:shadow transition-all duration-150 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('Add', 'Toevoegen')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
