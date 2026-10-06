'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dish } from '@/types';
import { useConfig } from '@/context/ConfigContext';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FilterToolbar } from '@/components/FilterToolbar';
import { DishGrid } from '@/components/DishGrid';
import { AboutSection } from '@/components/AboutSection';
import { OrderingGuideSection } from '@/components/OrderingGuideSection';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Footer } from '@/components/Footer';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const { config } = useConfig();
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [dailySpecialOnly, setDailySpecialOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [comingSoonOnly, setComingSoonOnly] = useState(false);

  // Initial fetch from backend API asynchronously: query availability=true
  useEffect(() => {
    let ignore = false;
    async function loadDishes() {
      try {
        const res = await fetch('/api/dishes?availability=true', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch dishes');
        const data = await res.json();
        if (!ignore && data && Array.isArray(data.data)) {
          // Strictly only show available dishes on the landing page
          const availableOnly = data.data.filter((d: Dish) => d.is_available);
          setAllDishes(availableOnly);
        }
      } catch (err) {
        console.error('Error loading dishes:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDishes();
    return () => {
      ignore = true;
    };
  }, []);

  // Client-side compound filtering:
  // Strictly enforce availability for landing page dishes.
  // daily_special, tags/category, search are OR condition among themselves when provided.
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      // 1. Availability filter: strictly available dishes on landing page
      if (!dish.is_available || (inStockOnly && !dish.is_available)) {
        return false;
      }

      // If Coming Soon filter is active
      if (comingSoonOnly && !dish.is_coming_soon) {
        return false;
      }

      // 2. OR Filters group: search, tag/category, dailySpecial
      const hasSearch = search.trim().length > 0;
      const hasTag = activeTag !== 'All';
      const hasSpecial = dailySpecialOnly;

      const hasOrFilters = hasSearch || hasTag || hasSpecial;

      // If no OR filters are selected, pass availability check
      if (!hasOrFilters) {
        return true;
      }

      // If daily_special is true and dish is daily_special
      if (hasSpecial && dish.daily_special) {
        return true;
      }

      // If tag / category is selected
      if (hasTag) {
        const target = activeTag.toLowerCase().replace(/\s+/g, '-');
        const targetClean = activeTag.toLowerCase();
        const dishTags = (dish.tags || []).map((t) => t.toLowerCase());
        const dishCategory = (dish.category || '').toLowerCase();

        if (
          dishCategory === targetClean ||
          dishTags.includes(target) ||
          dishTags.includes(targetClean)
        ) {
          return true;
        }
      }

      // If search query is provided and dish name or description matches
      if (hasSearch) {
        const query = search.trim().toLowerCase();
        if (
          dish.name.toLowerCase().includes(query) ||
          dish.description.toLowerCase().includes(query) ||
          (dish.category && dish.category.toLowerCase().includes(query))
        ) {
          return true;
        }
      }

      return false;
    });
  }, [allDishes, search, activeTag, dailySpecialOnly, inStockOnly, comingSoonOnly]);

  const handleResetFilters = () => {
    setSearch('');
    setActiveTag('All');
    setDailySpecialOnly(false);
    setInStockOnly(true);
    setComingSoonOnly(false);
  };

  const handleScrollToMenu = () => {
    const el = document.getElementById('menu') || document.getElementById('street-menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSpecialsFilter = () => {
    setDailySpecialOnly(true);
    handleScrollToMenu();
  };

  const { menu_section } = config;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onExploreClick={handleScrollToMenu}
          onSpecialsClick={handleSpecialsFilter}
        />

        {/* Menu Section */}
        <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-stone-200/90 text-stone-700 text-xs font-semibold tracking-widest mb-2 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#C07C27]" />
                <span>{menu_section?.eyebrow || 'FIND YOUR FAVOURITE'}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-900">
                {menu_section?.title || 'The menu'}
              </h2>
              <p className="text-sm sm:text-base text-stone-600 mt-1">
                {menu_section?.subtitle || 'Choose something delicious.'}
              </p>
            </div>
          </div>

          {/* Interactive Filter Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs">
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              activeTag={activeTag}
              onTagChange={setActiveTag}
              dailySpecialOnly={dailySpecialOnly}
              onDailySpecialChange={setDailySpecialOnly}
              inStockOnly={inStockOnly}
              onInStockChange={setInStockOnly}
              comingSoonOnly={comingSoonOnly}
              onComingSoonChange={setComingSoonOnly}
              onResetFilters={handleResetFilters}
              totalCount={allDishes.length}
              filteredCount={filteredDishes.length}
            />
          </div>

          {/* Dish Grid Display */}
          <DishGrid
            dishes={filteredDishes}
            loading={loading}
            onResetFilters={handleResetFilters}
          />
        </section>

        {/* About Story Section */}
        <AboutSection />

        {/* 3-Step Ordering & Occasions Guide */}
        <OrderingGuideSection />
      </main>

      {/* Cart Drawer & Checkout Modal */}
      <CartDrawer />
      <CheckoutModal />

      <Footer />
    </div>
  );
}
