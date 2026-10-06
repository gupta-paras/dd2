'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { generateWhatsAppOrderUrl } from '@/lib/config-shared';
import {
  X,
  CheckCircle2,
  Bike,
  Building,
  Sparkles,
  Clock,
  MapPin,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Send,
} from 'lucide-react';

export function CheckoutModal() {
  const {
    items,
    totalAmount,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
  } = useCart();
  const { success } = useToast();
  const { config } = useConfig();

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [name, setName] = useState('Sophie van Dijk');
  const [address, setAddress] = useState('Prinsengracht 288, 1016 HJ Amsterdam');
  const [phone, setPhone] = useState('+31 6 1234 5678');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ideal' | 'card' | 'whatsapp'>('whatsapp');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isCheckoutOpen) return null;

  const freeThreshold = config.delivery.free_threshold || 25.0;
  const standardFee = config.delivery.fee || 2.5;
  const deliveryFee = deliveryMethod === 'delivery' && totalAmount < freeThreshold ? standardFee : 0;
  const finalTotal = totalAmount + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrder = `DD-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(generatedOrder);

    // Build the WhatsApp message and URL with current configuration and order payload
    const waUrl = generateWhatsAppOrderUrl(config, {
      orderId: generatedOrder,
      customerName: name,
      customerPhone: phone,
      customerAddress: deliveryMethod === 'delivery' ? address : undefined,
      orderType: deliveryMethod,
      notes: notes.trim() || undefined,
      items: items.map((i) => ({
        name: i.dish.name,
        quantity: i.quantity,
        price: i.dish.price,
      })),
      subtotal: totalAmount,
      deliveryFee,
      total: finalTotal,
    });

    setWhatsappUrl(waUrl);

    // Simulate order registration in backend and open WhatsApp
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      success('Order Created!', `Order #${generatedOrder} ready. Opening WhatsApp to send to kitchen...`);

      // Auto-open WhatsApp link in a new tab
      try {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Browser blocked popup, manual button provided:', err);
      }
    }, 800);
  };

  const handleCopyOrder = () => {
    if (!whatsappUrl) return;
    try {
      // Extract encoded text param from URL
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
          aria-label="Close modal"
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
                Order #{orderNumber} Generated
              </div>
              <h2 className="text-2xl font-black text-stone-900">
                Ready to Send on WhatsApp!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Your order for <span className="font-bold text-stone-900">{config.restaurant.name}</span> has been formatted. Click below to send directly to our kitchen WhatsApp.
              </p>
            </div>

            {/* Primary WhatsApp Action Button */}
            <div className="space-y-2.5 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Open &amp; Send on WhatsApp</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>

              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[11px] text-stone-500">
                  Kitchen WhatsApp: <strong className="text-stone-700">{config.restaurant.whatsapp_number}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied Text!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Order Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Configured details card */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/90 text-left space-y-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900">Estimated Ready Time</p>
                  <p className="text-xs text-stone-500">
                    {deliveryMethod === 'delivery'
                      ? config.delivery.estimated_time
                      : config.delivery.pickup_ready_time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-stone-100 pt-2.5">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    {deliveryMethod === 'delivery' ? 'Delivering To' : 'Pick Up Location'}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {deliveryMethod === 'delivery' ? address : config.address.full}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-stone-100 pt-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900">Kitchen Timings</p>
                  <p className="text-xs text-stone-500">
                    {config.timings.display_hours} • {config.timings.service_note}
                  </p>
                </div>
              </div>
            </div>

            {/* Finish action */}
            <button
              onClick={handleFinish}
              className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Back to Menu &amp; Clear Basket
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder}>
            <div className="p-6 border-b border-stone-200 bg-white">
              <h2 className="text-xl font-bold text-stone-900">
                Checkout &amp; WhatsApp Transmission
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Orders are sent directly to the kitchen on WhatsApp for instant confirmation.
              </p>

              {/* Delivery / Pickup Tabs */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deliveryMethod === 'delivery'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Bike Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deliveryMethod === 'pickup'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Canal Pickup</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[58vh] overflow-y-auto">
              {/* WhatsApp Hotline Banner */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-900 leading-snug">
                  WhatsApp Hotline: <strong>{config.restaurant.whatsapp_number}</strong>
                  <br />
                  <span className="text-[11px] text-emerald-700">
                    Your order message will automatically open in WhatsApp upon placing.
                  </span>
                </p>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Address (if delivery) */}
              {deliveryMethod === 'delivery' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Amsterdam Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, house number, Amsterdam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              )}

              {/* Pickup location notice */}
              {deliveryMethod === 'pickup' && (
                <div className="p-3 rounded-xl bg-stone-100 border border-stone-200/80 text-xs text-stone-700 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pickup Counter:</span> {config.address.full}
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Ready in approx. {config.delivery.pickup_ready_time}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+31 6 ... or +1 ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Kitchen Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Kitchen Notes or Spice Preference (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild spice, extra mint raita, doorbell 2nd floor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Payment Method / Preferred Settlement */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Payment / Settlement Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ideal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'ideal'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-1 ring-amber-500'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>iDEAL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-1 ring-amber-500'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Card on Delivery</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Total & Place Order Button */}
            <div className="p-6 border-t border-stone-200 bg-white space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">Total Due</span>
                <span className="text-xl font-black text-stone-900">
                  €{finalTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Preparing WhatsApp Transmission...</span>
                  </div>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Place &amp; Send on WhatsApp • €{finalTotal.toFixed(2)}</span>
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
