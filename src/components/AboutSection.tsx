'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Sparkles, ChefHat } from 'lucide-react';

export function AboutSection() {
  const { config } = useConfig();
  const { language, t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const { about } = config;
  const isNl = language === 'nl';

  const eyebrow = isNl ? about.eyebrow_nl : about.eyebrow;
  const title = isNl ? about.title_nl : about.title;
  const bio = isNl ? about.bio_nl : about.bio;

  return (
    <section id="about" className="py-20 bg-[#F6F4EE] border-t border-b border-[#EAE6DF] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-stone-200/90 text-stone-700 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C07C27]" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
              {title}
            </h2>
          </div>

          {/* Story Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-8 sm:p-12 shadow-2xs flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
            {/* Subtle background heritage emblem */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#C07C27]/5 to-transparent pointer-events-none rounded-full blur-2xl -mr-20 -mt-20" />

            {/* Portrait Framing */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden border border-[#EAE6DF] shadow-xs bg-stone-100">
              {!imageError && about.photo_url ? (
                <Image
                  src={about.photo_url}
                  alt={about.name}
                  fill
                  sizes="224px"
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] text-stone-700 p-4 text-center">
                  <ChefHat className="w-12 h-12 text-[#C07C27] mb-2" />
                  <span className="text-xs font-serif">{about.name}</span>
                </div>
              )}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#1A1917]/90 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-2.5 rounded-lg text-center tracking-wide">
                {about.name}
              </div>
            </div>

            {/* Content text */}
            <div className="space-y-4 text-center md:text-left relative z-10">
              <div className="inline-flex items-center gap-2 text-[#8C5716] font-medium text-sm tracking-wide">
                <Heart className="w-4 h-4 fill-[#C07C27] text-[#C07C27]" />
                <span className="font-serif italic">{t('Founder & Chef —', 'Oprichtster & Chef —')}</span>
                <span className="font-semibold text-stone-900">{about.name}</span>
              </div>
              <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
                {bio}
              </p>
              <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {t('Authentic Family Recipes', 'Authentieke familierecepten')}
                </span>
                <span className="text-stone-300">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C07C27]" />
                  {t('Made Fresh Daily', 'Dagelijks vers bereid')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
