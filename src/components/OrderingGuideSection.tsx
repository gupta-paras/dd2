'use client';

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { MessageCircle, ShoppingBag, CheckCircle2, Gift, SlidersHorizontal, Sparkles } from 'lucide-react';

export function OrderingGuideSection() {
  const { config } = useConfig();
  const { language, t } = useLanguage();
  const { how_to_order, occasions, ordering_notice, restaurant } = config;

  const isNl = language === 'nl';
  const eyebrow = isNl ? how_to_order.eyebrow_nl : how_to_order.eyebrow;
  const title = isNl ? how_to_order.title_nl : how_to_order.title;
  const pickupNotice = isNl ? ordering_notice.pickup_info_nl : ordering_notice.pickup_info;

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <ShoppingBag className="w-5 h-5 text-amber-600" />;
      case 1:
        return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      case 2:
      default:
        return <CheckCircle2 className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStepBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-amber-50 border-amber-200/80';
      case 1:
        return 'bg-emerald-50 border-emerald-200/80';
      case 2:
      default:
        return 'bg-orange-50 border-orange-200/80';
    }
  };

  const phone =
    restaurant.whatsapp_phone_raw || restaurant.whatsapp_number.replace(/[^0-9]/g, '');

  return (
    <section id="ordering" className="py-20 bg-white border-b border-stone-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {title}
          </h2>
          {pickupNotice && (
            <p className="text-stone-500 text-sm max-w-xl mx-auto leading-relaxed">
              {pickupNotice}
            </p>
          )}
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {how_to_order.steps.map((stepItem, idx) => {
            const stepTitle = isNl ? stepItem.title_nl : stepItem.title;
            const stepDesc = isNl ? stepItem.desc_nl : stepItem.desc;

            return (
              <div
                key={stepItem.step || idx}
                className="relative bg-[#FAF9F6] rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:border-amber-300 transition-colors shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-amber-700/60 font-mono">
                      {stepItem.step}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${getStepBg(
                        idx
                      )}`}
                    >
                      {getStepIcon(idx)}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">{stepTitle}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{stepDesc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Occasions & Customizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Birthday & Party Orders */}
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200/80 p-7 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-amber-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                {isNl ? occasions.party_orders_title_nl : occasions.party_orders_title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isNl ? occasions.party_orders_desc_nl : occasions.party_orders_desc}
              </p>
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(
                  isNl
                    ? 'Hoi Desi Dutch! Ik wil graag informeren naar een pre-order voor een feestje/verjaardag.'
                    : 'Hi Desi Dutch! I would like to inquire about a party/birthday catering pre-order.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 pt-1"
              >
                <span>
                  {t('Discuss party order on WhatsApp →', 'Bespreek feestbestelling via WhatsApp →')}
                </span>
              </a>
            </div>
          </div>

          {/* Made to your liking */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-2xl border border-emerald-200/80 p-7 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                {isNl ? occasions.customization_title_nl : occasions.customization_title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isNl ? occasions.customization_desc_nl : occasions.customization_desc}
              </p>
              <p className="text-xs text-emerald-800 font-semibold pt-1">
                {t(
                  'Mention mild, medium, spicy, or dietary preferences in chat.',
                  'Geef mild, medium, pittig of dieetwensen door in de chat.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
