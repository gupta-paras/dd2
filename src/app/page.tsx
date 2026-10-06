'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dish } from '@/types';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FilterToolbar } from '@/components/FilterToolbar';
import { DishGrid } from '@/components/DishGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [dailySpecialOnly, setDailySpecialOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);

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
  // daily_special, tags, name are OR condition among themselves when provided.
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      // 1. Availability filter: only available dishes on the landing page
      if (!dish.is_available) {
        return false;
      }

      // 2. OR Filters group: search, tag, dailySpecial
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

      // If tag is selected and dish includes tag (case-insensitive)
      if (hasTag) {
        const dishTags = dish.tags.map((t) => t.toLowerCase());
        if (dishTags.includes(activeTag.toLowerCase())) {
          return true;
        }
      }

      // If search query is provided and dish name or description matches
      if (hasSearch) {
        const query = search.trim().toLowerCase();
        if (
          dish.name.toLowerCase().includes(query) ||
          dish.description.toLowerCase().includes(query)
        ) {
          return true;
        }
      }

      return false;
    });
  }, [allDishes, search, activeTag, dailySpecialOnly, inStockOnly]);

  const handleResetFilters = () => {
    setSearch('');
    setActiveTag('All');
    setDailySpecialOnly(false);
    setInStockOnly(true);
  };

  const handleScrollToMenu = () => {
    const el = document.getElementById('street-menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSpecialsFilter = () => {
    setDailySpecialOnly(true);
    handleScrollToMenu();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onExploreClick={handleScrollToMenu}
          onSpecialsClick={handleSpecialsFilter}
        />

        {/* Menu Section */}
        <section id="street-menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/70 text-orange-950 text-xs font-bold tracking-wide mb-2">
                Fresh From The Kitchen
              </div>
              <h2 className="text-3xl font-black tracking-tight text-stone-900">
                Amsterdam &times; Delhi Street Menu
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Handcrafted snacks, loaded kapsalons, and aromatic sweet treats.
              </p>
            </div>
          </div>

          {/* Interactive Filter Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              activeTag={activeTag}
              onTagChange={setActiveTag}
              dailySpecialOnly={dailySpecialOnly}
              onDailySpecialChange={setDailySpecialOnly}
              inStockOnly={inStockOnly}
              onInStockChange={setInStockOnly}
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
      </main>

      {/* Cart Drawer & Checkout Modal */}
      <CartDrawer />
      <CheckoutModal />

      <Footer />
    </div>
  );
}
