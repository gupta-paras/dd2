'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { generateWhatsAppOrderUrl } from '@/lib/config-shared';
import {
  X,
  CheckCircle2,
  Sparkles,
  Clock,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Send,
  ShoppingBag,
} from 'lucide-react';

export function CheckoutModal() {
  const { items, totalAmount, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  const { success } = useToast();
  const { config } = useConfig();
  const { lang, t } = useLanguage();

  const isNl = lang === 'nl';

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrder = `DD-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(generatedOrder);

    // Build the WhatsApp message and URL with current configuration and order payload
    const waUrl = generateWhatsAppOrderUrl(config, {
      orderId: generatedOrder,
      customerName: name.trim() || undefined,
      notes: notes.trim() || undefined,
      items: items.map((i) => ({
        name: isNl && i.dish.name_nl ? i.dish.name_nl : i.dish.name,
        quantity: i.quantity,
        price: i.dish.price,
      })),
      total: totalAmount,
      language: lang,
    });

    setWhatsappUrl(waUrl);

    // Simulate order registration in backend and open WhatsApp
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      success(
        t('Order Created!', 'Bestelling Aangemaakt!'),
        t(
          `Order #${generatedOrder} ready. Opening WhatsApp to send to kitchen...`,
          `Bestelling #${generatedOrder} gereed. WhatsApp wordt geopend om naar de keuken te sturen...`
        )
      );

      // Auto-open WhatsApp link in a new tab
      try {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Browser blocked popup, manual button provided:', err);
      }
    }, 700);
  };

  const handleCopyOrder = () => {
    if (!whatsappUrl) return;
    try {
      const urlObj = new URL(whatsappUrl);
      const textParam = urlObj.searchParams.get('text') || '';
      navigator.clipboard.writeText(textParam);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      navigator.clipboard.writeText(whatsappUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFinish = () => {
    clearCart();
    setIsSuccess(false);
    setIsCheckoutOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#FAF9F6] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        <button
          onClick={() => {
            if (isSuccess) {
              handleFinish();
            } else {
              setIsCheckoutOpen(false);
            }
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          aria-label={t('Close modal', 'Sluit venster')}
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Confirmation Screen with WhatsApp Links */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {t(`Order #${orderNumber} Generated`, `Bestelling #${orderNumber} Aangemaakt`)}
              </div>
              <h2 className="text-2xl font-black text-stone-900">
                {t('Ready to Send on WhatsApp!', 'Klaar om te verzenden via WhatsApp!')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                {t(
                  `Your order for ${config.restaurant.name} has been formatted. Click below to send directly to our kitchen WhatsApp.`,
                  `Je bestelling voor ${config.restaurant.name} is klaargezet. Klik hieronder om direct naar onze keuken-WhatsApp te versturen.`
                )}
              </p>
            </div>

            {/* Primary WhatsApp Action Button */}
            <div className="space-y-2.5 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#128C7E] hover:bg-[#075E54] active:scale-[0.99] text-white font-medium text-sm shadow-2xs transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{t('Open & Send on WhatsApp', 'Open & Verstuur via WhatsApp')}</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>

              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[11px] text-stone-500">
                  {t('Kitchen WhatsApp:', 'Keuken WhatsApp:')}{' '}
                  <strong className="text-stone-700">{config.restaurant.whatsapp_number}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{t('Copied Text!', 'Gekopieerd!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{t('Copy Order Text', 'Kopieer besteltekst')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Configured details card */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/90 text-left space-y-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    {t('Collection & Pickup Info', 'Afhaalinformatie')}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                    {isNl ? config.ordering_notice.pickup_info_nl : config.ordering_notice.pickup_info}
                  </p>
                </div>
              </div>
            </div>

            {/* Finish action */}
            <button
              onClick={handleFinish}
              className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
            >
              {t('Back to Menu & Clear Basket', 'Terug naar menu & mandje legen')}
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder}>
            <div className="p-6 border-b border-stone-200 bg-white">
              <h2 className="text-xl font-bold text-stone-900">
                {t('Checkout & WhatsApp Transmission', 'Bestelling afronden via WhatsApp')}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {t(
                  'Orders are sent directly to the kitchen on WhatsApp for instant confirmation.',
                  'Bestellingen worden rechtstreeks via WhatsApp naar de keuken gestuurd voor directe bevestiging.'
                )}
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[58vh] overflow-y-auto">
              {/* WhatsApp Hotline Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-snug">
                  <p>
                    {t('WhatsApp Hotline:', 'WhatsApp Bestelnummer:')}{' '}
                    <strong>{config.restaurant.whatsapp_number}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {t(
                      'Your order message will automatically open in WhatsApp upon placing.',
                      'Je bestelling opent automatisch in WhatsApp met alle gerechten klaargezet.'
                    )}
                  </p>
                </div>
              </div>

              {/* Pickup Only Notice Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <p className="font-bold">{t('Pickup Only Notice', 'Alleen Afhalen')}</p>
                  <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                    {isNl ? config.ordering_notice.pickup_info_nl : config.ordering_notice.pickup_info}
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="bg-white rounded-xl p-3 border border-stone-200 text-xs space-y-1.5">
                <div className="font-bold text-stone-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('Order Items Summary', 'Overzicht bestelling')}</span>
                </div>
                <div className="divide-y divide-stone-100 max-h-32 overflow-y-auto">
                  {items.map((it) => (
                    <div key={it.dish.dish_id} className="py-1 flex justify-between text-stone-600 text-xs">
                      <span className="truncate pr-2">
                        {it.quantity}x {isNl && it.dish.name_nl ? it.dish.name_nl : it.dish.name}
                      </span>
                      <span className="font-medium shrink-0">€{(it.dish.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('Your Name (Optional)', 'Je Naam (Optioneel)')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('e.g. Sophie', 'bijv. Sophie')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Preferred collection time or other requests */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t(
                    'Preferred collection time or other requests (Optional)',
                    'Gewenste afhaaltijd of andere verzoeken (Optioneel)'
                  )}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t(
                    'e.g. Tomorrow at 18:30, less spicy curry',
                    'bijv. Morgen om 18:30, minder pittige curry'
                  )}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Footer Total & Place Order Button */}
            <div className="p-6 border-t border-stone-200 bg-white space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">{t('Total Due', 'Totaalbedrag')}</span>
                <span className="font-serif text-2xl font-medium text-stone-900">
                  €{totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-4 rounded-xl bg-[#1A1917] hover:bg-[#2C2A26] active:scale-[0.99] disabled:opacity-50 text-white font-medium text-sm shadow-2xs transition-all cursor-pointer border border-stone-800"
              >
                {isSubmitting ? (
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>{t('Preparing WhatsApp Transmission...', 'WhatsApp bericht wordt klaargezet...')}</span>
                  </div>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>
                      {t('Place & Send on WhatsApp', 'Plaats & Verstuur via WhatsApp')} • €{totalAmount.toFixed(2)}
                    </span>
                    <Send className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
