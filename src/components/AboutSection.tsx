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
    <section id="about" className="py-20 bg-[#FBF9F5] border-t border-b border-stone-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {title}
            </h2>
          </div>

          {/* Story Card */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Portrait Framing */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-200/60 shadow-md bg-stone-100">
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
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800 p-4 text-center">
                  <ChefHat className="w-12 h-12 text-amber-600 mb-2" />
                  <span className="text-xs font-bold">{about.name}</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg text-center">
                {about.name}
              </div>
            </div>

            {/* Content text */}
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-amber-800 font-bold text-sm tracking-wide">
                <Heart className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>{t('Founder & Chef —', 'Oprichtster & Chef —')} {about.name}</span>
              </div>
              <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
                {bio}
              </p>
              <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {t('Authentic Family Recipes', 'Authentieke familierecepten')}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
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
