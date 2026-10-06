'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dish, DishCreateInput, DishUpdateInput } from '@/types';
import {
  X,
  Sparkles,
  CheckCircle2,
  Ban,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';

interface DishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DishCreateInput | DishUpdateInput) => Promise<void>;
  initialDish?: Dish | null;
  mode: 'create' | 'edit';
}

const CATEGORY_OPTIONS = [
  'Curries',
  'Biryani',
  'Snacks',
  'Breads',
  'Rice',
  'Drinks',
  'South Indian',
  'Desserts',
];

const PRESET_TAGS = [
  'curries',
  'biryani',
  'snacks',
  'breads',
  'rice',
  'drinks',
  'south-indian',
  'desserts',
  'vegetarian',
  'spicy',
  'sweet',
  'comfort-food',
];

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Butter Chicken',
    url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/butter-chicken.jpg',
  },
  {
    name: 'Biryani',
    url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/biryani.jpg',
  },
  {
    name: 'Samosa',
    url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/samosa.jpg',
  },
  {
    name: 'Lemon Rice',
    url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/menu-lemon-rice.jpg',
  },
  {
    name: 'Onion Tomato Uttapam',
    url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/menu-onion-tomato-uttapam.jpg',
  },
];

export function DishFormModal({
  isOpen,
  onClose,
  onSave,
  initialDish,
  mode,
}: DishFormModalProps) {
  const [name, setName] = useState(initialDish?.name ?? '');
  const [description, setDescription] = useState(initialDish?.description ?? '');
  const [photoUrl, setPhotoUrl] = useState(
    initialDish?.photo_url ?? SAMPLE_PHOTO_PRESETS[0].url
  );
  const [category, setCategory] = useState(initialDish?.category ?? 'Curries');
  const [price, setPrice] = useState(
    initialDish ? initialDish.price.toString() : '12.00'
  );
  const [tags, setTags] = useState<string[]>(
    initialDish?.tags && initialDish.tags.length > 0
      ? initialDish.tags
      : ['curries']
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [dailySpecial, setDailySpecial] = useState(
    Boolean(initialDish?.daily_special)
  );
  const [isAvailable, setIsAvailable] = useState(
    initialDish?.is_available ?? true
  );
  const [isComingSoon, setIsComingSoon] = useState(
    Boolean(initialDish?.is_coming_soon) || (initialDish ? initialDish.price === 0 : false)
  );

  const [imageLoadError, setImageLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tagToToggle: string) => {
    const normalized = tagToToggle.toLowerCase().trim();
    if (tags.map((t) => t.toLowerCase()).includes(normalized)) {
      setTags(tags.filter((t) => t.toLowerCase() !== normalized));
    } else {
      setTags([...tags, normalized]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim().toLowerCase();
    if (cleanTag && !tags.map((t) => t.toLowerCase()).includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setNewTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend validations
    if (!name.trim()) {
      setErrorMessage('Dish name is required');
      return;
    }
    if (!photoUrl.trim()) {
      setErrorMessage('Photo URL is required');
      return;
    }
    const parsedPrice = isComingSoon ? 0 : parseFloat(price);
    if (!isComingSoon && (isNaN(parsedPrice) || parsedPrice < 0)) {
      setErrorMessage('Price must be a valid number');
      return;
    }
    if (tags.length === 0) {
      setErrorMessage('At least one tag is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        description: description.trim(),
        photo_url: photoUrl.trim(),
        price: parsedPrice,
        category: category.trim(),
        tags,
        daily_special: dailySpecial,
        is_available: isAvailable,
        is_coming_soon: isComingSoon,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save dish';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-[#FAF9F6] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {mode === 'create' ? 'Add New Desi Dutch Dish' : `Edit: ${name || 'Dish'}`}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {mode === 'create'
                ? 'Create a new dish entry for the live menu.'
                : 'Modify dish details, pricing, coming-soon status, and availability.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-xs font-semibold text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
            {/* Live Image Preview & URL section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left: Input for Photo URL */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700">
                  Dish Photo URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      setImageLoadError(false);
                    }}
                    placeholder="https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                {/* Preset URL quick pickers */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 block">
                    Reference Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PHOTO_PRESETS.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(sample.url);
                          setImageLoadError(false);
                        }}
                        className="text-[10px] font-medium px-2 py-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 transition-colors cursor-pointer"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: LIVE 16/10 Aspect Ratio Image Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                  <span>Live 16/10 Framing Preview</span>
                  <span className="text-amber-700 font-bold">Storefront View</span>
                </div>
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-300 shadow-inner">
                  {photoUrl && !imageLoadError ? (
                    <Image
                      src={photoUrl}
                      alt={name || 'Preview'}
                      fill
                      sizes="350px"
                      className="object-cover"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                      <ImageIcon className="w-8 h-8 mb-1 text-stone-300" />
                      <span className="text-xs">Invalid or empty photo URL</span>
                    </div>
                  )}

                  {/* Floating Badges overlay preview */}
                  <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-1 pointer-events-none">
                    {dailySpecial ? (
                      <span className="glass-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-900 border border-amber-200 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Daily Special
                      </span>
                    ) : <span />}

                    {isComingSoon ? (
                      <span className="glass-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-purple-900 bg-purple-50/90 border border-purple-200">
                        Coming Soon
                      </span>
                    ) : isAvailable ? (
                      <span className="glass-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                        In Stock
                      </span>
                    ) : (
                      <span className="glass-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-stone-600 border border-stone-300 bg-stone-100">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dish Name, Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-stone-700">
                    Dish Name
                  </label>
                  <span className="text-[10px] text-stone-400">
                    {name.length}/120
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Butter chicken"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-semibold"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Price in EUR (€)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-bold text-sm">
                    €
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={isComingSoon}
                    value={isComingSoon ? '0.00' : price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="12.00"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-bold ${
                      isComingSoon ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-stone-700">
                  Description &amp; Ingredients
                </label>
                <span className="text-[10px] text-stone-400">
                  {description.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tender chicken cooked in a creamy tomato sauce with aromatic spices..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Dietary Tags Section */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-stone-700">
                Dietary &amp; Category Tags (Click to toggle)
              </label>

              {/* Preset clickable chips */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((tag) => {
                  const isSelected = tags.map((t) => t.toLowerCase()).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer capitalize ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                      }`}
                    >
                      {tag} {isSelected ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Custom tag input */}
              <div className="flex gap-2 items-center pt-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add custom tag (e.g. vegan, mild)..."
                  className="max-w-xs px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  + Add Tag
                </button>
              </div>

              {/* Active tags preview pills */}
              <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-stone-400">Selected tags:</span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(t)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Toggles for Daily Special, Coming Soon, and Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200">
              {/* Daily Special Toggle */}
              <div
                onClick={() => setDailySpecial(!dailySpecial)}
                className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                  dailySpecial
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      dailySpecial
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Daily Special
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Featured item
                    </p>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    dailySpecial ? 'bg-amber-500' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      dailySpecial ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Coming Soon Toggle */}
              <div
                onClick={() => setIsComingSoon(!isComingSoon)}
                className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                  isComingSoon
                    ? 'bg-purple-50/80 border-purple-300 ring-1 ring-purple-400'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isComingSoon
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Coming Soon
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Badge &amp; disable ordering
                    </p>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    isComingSoon ? 'bg-purple-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isComingSoon ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* In Stock / Availability Toggle */}
              <div
                onClick={() => setIsAvailable(!isAvailable)}
                className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                  isAvailable
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isAvailable
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {isAvailable ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      {isAvailable ? 'In Stock' : 'Sold Out'}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    isAvailable ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-stone-200 bg-white flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Create Dish' : 'Save Changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
