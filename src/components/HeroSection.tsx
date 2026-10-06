'use client';

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Sparkles, Flame, Clock, Compass, ArrowDown, Utensils } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onSpecialsClick?: () => void;
}

export function HeroSection({ onExploreClick, onSpecialsClick }: HeroSectionProps) {
  const { config } = useConfig();

  // Helper icon selector for features
  const getFeatureIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 1:
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 2:
        return <Compass className="w-4 h-4 text-emerald-600" />;
      case 3:
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getFeatureBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-amber-50';
      case 1:
        return 'bg-orange-50';
      case 2:
        return 'bg-emerald-50';
      case 3:
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-[#E7E5E4]/80">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-bl from-orange-200/30 to-amber-100/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Origin pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-semibold tracking-wide shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            {config.restaurant.hero_badge}
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
            {config.restaurant.hero_title_highlight}{' '}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              {config.restaurant.hero_title_accent}
            </span>
          </h1>

          {/* Subtitle description */}
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {config.restaurant.hero_subtitle}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 py-3.5 rounded-full shadow-md shadow-orange-900/15 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>Explore Menu</span>
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={onSpecialsClick}
              className="inline-flex items-center gap-2 bg-white/90 hover:bg-stone-50 text-stone-800 font-semibold px-6 py-3.5 rounded-full border border-stone-200 shadow-xs hover:border-amber-300 hover:text-amber-800 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Daily Specials</span>
            </button>
          </div>

          {/* Value Badges from Config */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            {config.features.map((feature, idx) => (
              <div
                key={feature.id || idx}
                className="p-3.5 rounded-xl bg-white/80 border border-stone-200/70 shadow-xs flex items-center gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${getFeatureBg(
                    idx
                  )} flex items-center justify-center shrink-0`}
                >
                  {getFeatureIcon(idx)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900">{feature.title}</p>
                  <p className="text-[11px] text-stone-500 truncate">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
