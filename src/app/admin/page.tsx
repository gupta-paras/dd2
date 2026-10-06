'use client';

import React, { useState, useEffect } from 'react';
import { Dish, DishCreateInput, DishUpdateInput } from '@/types';
import { useToast } from '@/context/ToastContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminMetrics } from '@/components/admin/AdminMetrics';
import { DishTable } from '@/components/admin/DishTable';
import { DishFormModal } from '@/components/admin/DishFormModal';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { Footer } from '@/components/Footer';

export default function AdminPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  const { success, error } = useToast();

  // Fetch all dishes from API asynchronously
  useEffect(() => {
    let ignore = false;
    async function loadDishes() {
      try {
        const res = await fetch('/api/dishes', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load dishes');
        const data = await res.json();
        if (!ignore && data && Array.isArray(data.data)) {
          setDishes(data.data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          error('Failed to load dishes', 'Could not retrieve dishes from SQLite.');
        }
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
  }, [error]);

  // Open Create Dish modal
  const handleOpenCreateModal = () => {
    setSelectedDish(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  // Open Edit Dish modal
  const handleOpenEditModal = (dish: Dish) => {
    setSelectedDish(dish);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  // Open Delete confirmation modal
  const handleOpenDeleteModal = (dish: Dish) => {
    setDishToDelete(dish);
    setIsDeleteModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveDish = async (data: DishCreateInput | DishUpdateInput) => {
    if (formMode === 'create') {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create dish');
      }

      const createdDish = json.data || json;
      setDishes((prev) => [...prev, createdDish]);
      success('Dish Created', `"${createdDish.name}" has been added to the menu.`);
    } else if (formMode === 'edit' && selectedDish) {
      const res = await fetch(`/api/dishes/${selectedDish.dish_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update dish');
      }

      const updatedDish = json.data || json;
      setDishes((prev) =>
        prev.map((d) => (d.dish_id === selectedDish.dish_id ? updatedDish : d))
      );
      success('Dish Updated', `"${updatedDish.name}" changes were saved.`);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async (dishId: string) => {
    try {
      const res = await fetch(`/api/dishes/${dishId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete dish');
      }

      setDishes((prev) => prev.filter((d) => d.dish_id !== dishId));
      success('Dish Deleted', 'Dish has been removed from the menu.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      error('Delete Error', msg);
      throw err;
    }
  };

  // 1-Click Inline Toggle: Daily Special
  const handleToggleSpecial = async (dish: Dish) => {
    const newSpecial = !dish.daily_special;

    // Optimistic update
    setDishes((prev) =>
      prev.map((d) =>
        d.dish_id === dish.dish_id ? { ...d, daily_special: newSpecial } : d
      )
    );

    try {
      const res = await fetch(`/api/dishes/${dish.dish_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_special: newSpecial }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Update failed');
      }

      success(
        newSpecial ? 'Daily Special Activated' : 'Special Removed',
        `"${dish.name}" ${newSpecial ? 'is now featured' : 'is back to regular menu'}.`
      );
    } catch {
      // Revert optimistic update
      setDishes((prev) =>
        prev.map((d) =>
          d.dish_id === dish.dish_id ? { ...d, daily_special: dish.daily_special } : d
        )
      );
      error('Update Failed', `Could not toggle daily special for "${dish.name}".`);
    }
  };

  // 1-Click Inline Toggle: Coming Soon
  const handleToggleComingSoon = async (dish: Dish) => {
    const newComingSoon = !dish.is_coming_soon;

    // Optimistic update
    setDishes((prev) =>
      prev.map((d) =>
        d.dish_id === dish.dish_id ? { ...d, is_coming_soon: newComingSoon } : d
      )
    );

    try {
      const res = await fetch(`/api/dishes/${dish.dish_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_coming_soon: newComingSoon }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Update failed');
      }

      success(
        newComingSoon ? 'Marked Coming Soon' : 'Marked Active',
        `"${dish.name}" ${newComingSoon ? 'is now coming soon' : 'is now active'}.`
      );
    } catch {
      // Revert optimistic update
      setDishes((prev) =>
        prev.map((d) =>
          d.dish_id === dish.dish_id ? { ...d, is_coming_soon: dish.is_coming_soon } : d
        )
      );
      error('Update Failed', `Could not toggle coming soon for "${dish.name}".`);
    }
  };

  // 1-Click Inline Toggle: Availability (In Stock / Sold Out)
  const handleToggleAvailability = async (dish: Dish) => {
    const newAvailability = !dish.is_available;

    // Optimistic update
    setDishes((prev) =>
      prev.map((d) =>
        d.dish_id === dish.dish_id ? { ...d, is_available: newAvailability } : d
      )
    );

    try {
      const res = await fetch(`/api/dishes/${dish.dish_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newAvailability }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Update failed');
      }

      success(
        newAvailability ? 'Dish In Stock' : 'Marked Sold Out',
        `"${dish.name}" is now ${newAvailability ? 'available for order' : 'sold out'}.`
      );
    } catch {
      // Revert optimistic update
      setDishes((prev) =>
        prev.map((d) =>
          d.dish_id === dish.dish_id ? { ...d, is_available: dish.is_available } : d
        )
      );
      error('Update Failed', `Could not update availability for "${dish.name}".`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <AdminHeader onAddNewDish={handleOpenCreateModal} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Real-time KPI Metric Cards */}
        <section aria-label="Kitchen Key Metrics">
          <AdminMetrics dishes={dishes} />
        </section>

        {/* Dish Management Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Menu Items &amp; Inventory Controls
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Toggle availability, coming soon, or daily specials instantly with one click.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
              <span className="w-8 h-8 border-3 border-amber-600/30 border-t-amber-600 rounded-full animate-spin inline-block mb-3" />
              <p className="text-xs font-semibold text-stone-500">
                Connecting to SQLite database...
              </p>
            </div>
          ) : (
            <DishTable
              dishes={dishes}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onToggleSpecial={handleToggleSpecial}
              onToggleAvailability={handleToggleAvailability}
              onToggleComingSoon={handleToggleComingSoon}
            />
          )}
        </section>
      </main>

      {/* Add / Edit Dish Modal */}
      <DishFormModal
        key={selectedDish ? selectedDish.dish_id : `new-${isFormModalOpen}`}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveDish}
        initialDish={selectedDish}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        dish={dishToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <Footer />
    </div>
  );
}
