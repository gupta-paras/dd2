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
        return <ShoppingBag className="w-4 h-4 text-[#C07C27]" />;
      case 1:
        return <MessageCircle className="w-4 h-4 text-emerald-700" />;
      case 2:
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#1D3557]" />;
    }
  };

  const phone =
    restaurant.whatsapp_phone_raw || restaurant.whatsapp_number.replace(/[^0-9]/g, '');

  return (
    <section id="ordering" className="py-20 bg-white border-b border-[#EAE6DF] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200/90 text-stone-700 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C07C27]" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            {title}
          </h2>
          {pickupNotice && (
            <p className="text-stone-500 text-sm max-w-xl mx-auto leading-relaxed">
              {pickupNotice}
            </p>
          )}
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14">
          {how_to_order.steps.map((stepItem, idx) => {
            const stepTitle = isNl ? stepItem.title_nl : stepItem.title;
            const stepDesc = isNl ? stepItem.desc_nl : stepItem.desc;

            return (
              <div
                key={stepItem.step || idx}
                className="relative bg-[#FAF8F5] rounded-2xl border border-[#EAE6DF] p-7 flex flex-col justify-between hover:border-[#C07C27]/40 transition-colors shadow-2xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-normal text-[#C07C27]">
                      {stepItem.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl border border-[#EAE6DF] bg-white flex items-center justify-center shadow-2xs">
                      {getStepIcon(idx)}
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">{stepTitle}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{stepDesc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Occasions & Customizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Birthday & Party Orders */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#EAE6DF] p-7 flex gap-4 hover:border-stone-300 transition-colors shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#EAE6DF] flex items-center justify-center shrink-0 shadow-2xs">
              <Gift className="w-5 h-5 text-[#C07C27]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-base font-medium text-stone-900">
                {isNl ? occasions.party_orders_title_nl : occasions.party_orders_title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C5716] hover:text-stone-900 pt-1"
              >
                <span>
                  {t('Discuss party order on WhatsApp →', 'Bespreek feestbestelling via WhatsApp →')}
                </span>
              </a>
            </div>
          </div>

          {/* Made to your liking */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#EAE6DF] p-7 flex gap-4 hover:border-stone-300 transition-colors shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#EAE6DF] flex items-center justify-center shrink-0 shadow-2xs">
              <SlidersHorizontal className="w-5 h-5 text-[#1D3557]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-base font-medium text-stone-900">
                {isNl ? occasions.customization_title_nl : occasions.customization_title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isNl ? occasions.customization_desc_nl : occasions.customization_desc}
              </p>
              <p className="text-xs text-stone-500 font-medium pt-1">
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
