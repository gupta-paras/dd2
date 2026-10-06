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

  // Helper to color tags tastefully with minimal muted tones
  const getTagStyle = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes('spicy')) {
      return 'bg-red-50/70 text-red-800 border-red-200/60';
    }
    if (lower.includes('veg')) {
      return 'bg-emerald-50/70 text-emerald-800 border-emerald-200/60';
    }
    if (lower.includes('curry') || lower.includes('curries')) {
      return 'bg-amber-50/70 text-amber-900 border-amber-200/60';
    }
    if (lower.includes('biryani')) {
      return 'bg-orange-50/70 text-orange-900 border-orange-200/60';
    }
    if (lower.includes('dessert') || lower.includes('sweet')) {
      return 'bg-rose-50/70 text-rose-800 border-rose-200/60';
    }
    return 'bg-[#FAF8F5] text-stone-700 border-stone-200/80';
  };

  return (
    <article
      className={`group relative flex flex-col bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#C07C27]/50 transition-all duration-300 ${
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
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-103 ${
              !dish.is_available && !isComingSoon ? 'grayscale contrast-75' : ''
            }`}
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] text-stone-400 p-4 text-center">
            <UtensilsCrossed className="w-10 h-10 mb-2 text-stone-300" />
            <span className="text-xs font-serif tracking-wide text-stone-500">Desi Dutch Kitchen</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 pointer-events-none">
          {/* Daily Special Ribbon */}
          {dish.daily_special ? (
            <div className="glass-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#8C5716] bg-[#FCF9F2]/95 border border-[#C07C27]/30 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C07C27] fill-[#C07C27]/40" />
              <span>{t('Daily Special', 'Favoriet uit de keuken')}</span>
            </div>
          ) : (
            <span />
          )}

          {/* Status Badge: Coming Soon / In Stock / Sold Out */}
          {isComingSoon ? (
            <div className="glass-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-stone-700 bg-white/95 border border-stone-200 shadow-2xs">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{t('Coming soon', 'Binnenkort')}</span>
            </div>
          ) : dish.is_available ? (
            <div className="glass-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-white/95 border border-emerald-200/70 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t('In Stock', 'Op voorraad')}</span>
            </div>
          ) : (
            <div className="glass-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-stone-600 bg-stone-100/95 border border-stone-300 shadow-2xs">
              <Ban className="w-3 h-3 text-stone-500" />
              <span>{t('Sold out', 'Uitverkocht')}</span>
            </div>
          )}
        </div>

        {/* Sold out overlay banner */}
        {!dish.is_available && !isComingSoon && (
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="bg-[#1A1917]/95 text-white text-[11px] font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-md shadow-md border border-white/15">
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
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F5] text-stone-800 border border-stone-200 capitalize">
                {dish.category}
              </span>
            )}
            {dish.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-md border capitalize ${getTagStyle(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-[#8C5716] transition-colors line-clamp-1 tracking-tight">
            {displayName}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Bottom Price & Add to Cart row */}
        <div className="pt-4 mt-4 border-t border-[#EAE6DF] flex items-center justify-between gap-3">
          {/* Price Styling */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400">
              {t('Price', 'Prijs')}
            </span>
            {isComingSoon ? (
              <span className="text-xs font-semibold text-stone-600 tracking-wide uppercase">
                {t('Coming soon', 'Binnenkort')}
              </span>
            ) : (
              <span className="font-serif text-xl font-medium text-stone-900 tracking-tight">
                €{dish.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Order / Stepper Action */}
          <div>
            {isComingSoon ? (
              <button
                disabled
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
              >
                {t('Coming soon', 'Binnenkort')}
              </button>
            ) : !dish.is_available ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl text-xs font-medium bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
              >
                {t('Unavailable', 'Niet beschikbaar')}
              </button>
            ) : quantity > 0 ? (
              /* Inline Quantity Stepper */
              <div className="inline-flex items-center gap-2 bg-[#1A1917] text-white rounded-xl p-1 shadow-xs border border-stone-800">
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
                className="inline-flex items-center gap-1.5 bg-[#1A1917] hover:bg-[#2C2A26] active:scale-95 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer border border-stone-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Add', 'Toevoegen')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
