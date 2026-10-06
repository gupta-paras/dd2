'use client';

import React from 'react';
import Image from 'next/image';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, ArrowDown, ShoppingBag, HeartHandshake } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onSpecialsClick?: () => void;
}

export function HeroSection({ onExploreClick, onSpecialsClick }: HeroSectionProps) {
  const { config } = useConfig();
  const { language, t } = useLanguage();
  const { hero, restaurant, ordering_notice } = config;

  const isNl = language === 'nl';
  const eyebrow = isNl ? hero.eyebrow_nl : hero.eyebrow;
  const title = isNl ? hero.title_nl : hero.title;
  const subtitle = isNl ? hero.subtitle_nl : hero.subtitle;
  const ctaBtn = isNl ? hero.cta_button_nl : hero.cta_button;
  const tagline = isNl ? hero.tagline_footer_nl : hero.tagline_footer;
  const cardTitle = isNl ? hero.card_title_nl : hero.card_title;
  const cardSubtitle = isNl ? hero.card_subtitle_nl : hero.card_subtitle;
  const pickupNotice = isNl ? ordering_notice.pickup_info_nl : ordering_notice.pickup_info;

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-[#E7E5E4]/80">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-bl from-orange-200/30 to-amber-100/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Origin pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-semibold tracking-wide shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <span>{eyebrow || `${restaurant.name.toUpperCase()} · INDIAN KITCHEN`}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
              {title.split('.').map((part, index, array) => {
                const trimmed = part.trim();
                if (!trimmed) return null;
                if (index === array.length - 2 || (index === array.length - 1 && array.length === 2)) {
                  return (
                    <span
                      key={index}
                      className="block sm:inline bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent"
                    >
                      {trimmed}.{' '}
                    </span>
                  );
                }
                return <span key={index}>{trimmed}. </span>;
              })}
            </h1>

            {/* Subtitle description */}
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl font-normal leading-relaxed">
              {subtitle}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 py-3.5 rounded-full shadow-md shadow-orange-900/15 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span>{ctaBtn || t('Explore the menu', 'Bekijk het menu')}</span>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={onSpecialsClick}
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-stone-50 text-stone-800 font-semibold px-6 py-3.5 rounded-full border border-stone-200 shadow-xs hover:border-amber-300 hover:text-amber-800 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t('Daily Specials', 'Dagspecials')}</span>
              </button>
            </div>

            {/* Pickup Notice Badge */}
            <div className="pt-2 text-xs font-semibold tracking-wider text-amber-900/80 flex items-center justify-center lg:justify-start gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{tagline}</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden p-3.5 group">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100">
                <Image
                  src={hero.card_image}
                  alt={cardTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300">
                    {cardTitle}
                  </span>
                  <h3 className="text-xl font-extrabold text-white leading-snug">
                    {cardSubtitle}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Notice Banner */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 max-w-4xl mx-auto flex items-center gap-3 text-amber-950 text-xs sm:text-sm">
          <ShoppingBag className="w-5 h-5 text-amber-700 shrink-0" />
          <p className="leading-relaxed font-medium">
            {pickupNotice}
          </p>
        </div>
      </div>
    </section>
  );
}
