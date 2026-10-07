'use client';

import React from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Clock, ShieldCheck, Globe, UtensilsCrossed } from 'lucide-react';

export function Footer() {
  const { config } = useConfig();
  const { lang, setLang, t } = useLanguage();

  const isNl = lang === 'nl';

  return (
    <footer className="mt-auto bg-[#141413] text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Story */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-[#1E1E1C] border border-[#C07C27]/40 flex items-center justify-center text-stone-100 font-serif font-medium text-lg shadow-inner">
                <span className="tracking-tighter">DD</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#1D3557] border border-[#141413]" title="Amsterdam Canal Heritage" />
                <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#C07C27] border border-[#141413]" title="Delhi Spice Heritage" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-white leading-tight">
                  {config.restaurant.name}
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-stone-400">
                  {isNl ? config.restaurant.cuisine_label_nl : config.restaurant.cuisine_label}
                </p>
              </div>
            </div>
            <p className="text-xs font-serif italic text-[#D89E4B]">
              {isNl ? config.restaurant.tagline_nl : config.restaurant.tagline}
            </p>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              {t(
                'Desi Dutch serves authentic Indian home cooking, prepared with passion and soul. Fresh ingredients, comforting spices, and pure hospitality.',
                'Desi Dutch serveert authentieke Indiase thuisgerechten, met passie en toewijding bereid. Verse ingrediënten, verwarmende specerijen en oprechte gastvrijheid.'
              )}
            </p>
          </div>

          {/* Ordering & Collection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              {t('Ordering & Pickup', 'Bestellen & Afhalen')}
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  {isNl ? config.ordering_notice.pickup_info_nl : config.ordering_notice.pickup_info}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links & Language */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              {t('Quick Navigation', 'Navigatie')}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="#menu" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-stone-500" />
                  {t('Our menu', 'Ons menu')}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-400 transition-colors">
                  {t('About me', 'Over mij')}
                </a>
              </li>
              <li>
                <a href="#ordering" className="hover:text-amber-400 transition-colors">
                  {t('How to order', 'Bestellen')}
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors font-medium text-stone-300"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  {t('Kitchen Admin Portal', 'Keuken Beheer')}
                </Link>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 text-xs">
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] text-stone-400">{t('Language:', 'Taal:')}</span>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`font-semibold cursor-pointer ${
                      lang === 'en' ? 'text-amber-400 underline underline-offset-2' : 'hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <span className="text-stone-600">|</span>
                  <button
                    type="button"
                    onClick={() => setLang('nl')}
                    className={`font-semibold cursor-pointer ${
                      lang === 'nl' ? 'text-amber-400 underline underline-offset-2' : 'hover:text-white'
                    }`}
                  >
                    NL
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 {config.restaurant.name}. {t('All rights reserved.', 'Alle rechten voorbehouden.')}</p>
          <p className="flex items-center gap-1">
            <span>{t('Crafted with', 'Gemaakt met')}</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>{t('for lovers of authentic Indian cuisine', 'voor liefhebbers van authentiek Indiaas eten')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
