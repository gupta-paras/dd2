'use client';

import React from 'react';
import Image from 'next/image';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowDown, Sparkles, Clock } from 'lucide-react';

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
  const cardTitle = isNl ? hero.card_title_nl : hero.card_title;
  const cardSubtitle = isNl ? hero.card_subtitle_nl : hero.card_subtitle;
  const pickupNotice = isNl ? ordering_notice.pickup_info_nl : ordering_notice.pickup_info;

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#E8E4DC]">
      {/* Subtle Dutch × Indian Heritage Watermark Background */}
      <div className="absolute inset-0 pattern-heritage opacity-40 pointer-events-none" />

      {/* Subtle dual cultural hairline watermark */}
      <div className="absolute right-6 top-8 hidden xl:block pointer-events-none opacity-20">
        <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="#C07C27" strokeWidth="0.75">
          {/* Subtle Indian mandala & Dutch geometric tile intersection */}
          <circle cx="50" cy="50" r="45" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="30" />
          <path d="M50 5 L50 95 M5 50 L95 50" stroke="#1D3557" />
          <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Origin pill badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#F4F1EB] border border-[#E8E4DC] text-stone-700 text-xs font-semibold tracking-wider uppercase shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C07C27]" />
              <span>{eyebrow || `${restaurant.name.toUpperCase()} · INDIAN KITCHEN`}</span>
              <span className="text-stone-300">|</span>
              <span className="text-[11px] text-stone-500 font-medium tracking-widest lowercase">ams × del</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#1A1917] leading-[1.14]">
              {title.split('.').map((part, index, array) => {
                const trimmed = part.trim();
                if (!trimmed) return null;
                if (index === array.length - 2 || (index === array.length - 1 && array.length === 2)) {
                  return (
                    <span
                      key={index}
                      className="italic font-normal text-[#C07C27]"
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
                className="inline-flex items-center gap-2 bg-[#1A1917] hover:bg-[#282724] active:scale-[0.98] text-[#FAF8F5] font-medium text-xs tracking-wider uppercase px-6 py-3.5 rounded-full shadow-xs transition-all duration-200 cursor-pointer border border-stone-800"
              >
                <span>{ctaBtn || t('Explore the menu', 'Bekijk het menu')}</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#E29D38]" />
              </button>
              <button
                onClick={onSpecialsClick}
                className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-medium text-xs tracking-wider uppercase px-6 py-3.5 rounded-full border border-[#E8E4DC] hover:border-stone-400 shadow-2xs transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C07C27]" />
                <span>{t('Daily Specials', 'Dagspecials')}</span>
              </button>
            </div>

            {/* Heritage Line */}
            <div className="pt-2 text-[11px] font-medium tracking-widest uppercase text-stone-500 flex items-center justify-center lg:justify-start gap-2.5">
              <span>Amsterdam Canal Heritage</span>
              <span className="text-stone-300">✦</span>
              <span>Authentic Delhi Spice</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Card (Museum-grade matte framing) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden p-3 group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={hero.card_image}
                  alt={cardTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#E29D38]">
                    {cardTitle}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white leading-snug">
                    {cardSubtitle}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Notice Banner */}
        <div className="mt-12 p-4 sm:p-5 rounded-xl bg-[#F4F1EB] border border-[#E8E4DC] max-w-4xl mx-auto flex items-start sm:items-center gap-3.5 text-stone-800 text-xs sm:text-sm">
          <Clock className="w-4 h-4 text-[#C07C27] shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed font-normal text-stone-700">
            {pickupNotice}
          </p>
        </div>
      </div>
    </section>
  );
}
