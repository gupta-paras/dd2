'use client';

import React from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import { Heart, MapPin, Clock, Phone, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';

export function Footer() {
  const { config } = useConfig();

  return (
    <footer className="mt-auto bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Story */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-serif font-black text-lg">
                DD
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {config.restaurant.name}
                </h3>
                <p className="text-xs text-stone-400">
                  {config.restaurant.cuisine_label}
                </p>
              </div>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Serving the authentic diversity of all Indian regional cuisines—North, South, Awadhi, Coastal &amp; Street Chaats—elevated with refined Western culinary craft.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Halal Meats • Fresh Seasonal Produce</span>
            </div>
          </div>

          {/* Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Kitchen &amp; Pickup
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <a
                  href={config.address.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  {config.address.full}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p>{config.timings.display_hours}</p>
                  <p className="text-[11px] text-stone-500">{config.timings.service_note}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href={`tel:${config.restaurant.phone.replace(/[^0-9+]/g, '')}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {config.restaurant.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <a
                  href={`https://wa.me/${config.restaurant.whatsapp_phone_raw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {config.restaurant.whatsapp_number}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Quick Portals
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Full Menu &amp; Specials
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                  Kitchen Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-stone-500">Amsterdam E-Bike Delivery</span>
              </li>
              <li>
                <span className="text-stone-500">Catering &amp; Special Events</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 {config.restaurant.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for authentic Indian food lovers</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
