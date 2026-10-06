import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import type { Dish } from '../src/db/schema';

const BASE_URL = 'http://localhost:3000';

describe('Desi Dutch Local API E2E Verification Suite', () => {
  before(async () => {
    // Check server is responsive
    const res = await fetch(`${BASE_URL}/api/dishes`);
    assert.strictEqual(res.ok, true, 'Server on localhost:3000 must be reachable');
  });

  describe('1. Endpoint Discovery & Base Responses', () => {
    it('GET /api/dishes returns 200 with bootstrapped dishes', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.count >= 50, `Expected at least 50 catalog dishes, got ${data.count}`);
    });

    it('GET /dishes (rewritten endpoint) returns identical 200 structure', async () => {
      const res = await fetch(`${BASE_URL}/dishes`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.count >= 50);
    });

    it('Verifies reference catalog dish data structures', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes`);
      const data = await res.json();
      const dishes: Dish[] = data.data;

      const butterChicken = dishes.find((d: Dish) => d.name.toLowerCase().includes('butter chicken'));
      assert.ok(butterChicken, 'Butter chicken should exist');
      assert.strictEqual(butterChicken.daily_special, true);
      assert.strictEqual(butterChicken.is_available, true);
      assert.strictEqual(butterChicken.price, 15);

      const biryani = dishes.find((d: Dish) => d.name.toLowerCase().includes('biryani'));
      assert.ok(biryani, 'Chicken biryani should exist');
      assert.strictEqual(biryani.is_available, true);
      assert.strictEqual(biryani.price, 15);

      const idli = dishes.find((d: Dish) => d.name.toLowerCase() === 'idli');
      assert.ok(idli, 'Idli (coming soon) should exist');
      assert.strictEqual(idli.is_coming_soon, true);
    });
  });

  describe('2. Compound Filter Scenarios', () => {
    it('Filter: availability=true (AND condition)', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?availability=true`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length > 0);
      for (const dish of data.data) {
        assert.strictEqual(dish.is_available, true, `Dish ${dish.name} should be available`);
      }
    });

    it('Filter: daily_special=true (OR condition)', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?daily_special=true`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length > 0);
      for (const dish of data.data) {
        assert.strictEqual(dish.daily_special, true, `Dish ${dish.name} should be daily special`);
      }
    });

    it('Filter: category=Biryani (OR condition)', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?category=Biryani`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length > 0);
      for (const dish of data.data) {
        assert.strictEqual((dish.category || '').toLowerCase(), 'biryani');
      }
    });

    it('Filter: name=butter (OR condition)', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?name=butter`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length >= 1);
      for (const dish of data.data) {
        assert.ok(
          dish.name.toLowerCase().includes('butter'),
          `Dish ${dish.name} should match butter substring`
        );
      }
    });

    it('Filter: is_coming_soon=true', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?is_coming_soon=true`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.length, 8);
      for (const dish of data.data) {
        assert.strictEqual(dish.is_coming_soon, true);
      }
    });

    it('Compound Filter: availability=true & daily_special=true (AND with OR)', async () => {
      const res = await fetch(
        `${BASE_URL}/api/dishes?availability=true&daily_special=true`
      );
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length > 0);
      for (const dish of data.data) {
        assert.strictEqual(dish.is_available, true);
        assert.strictEqual(dish.daily_special, true);
      }
    });
  });

  describe('3. REST API CRUD Mutations Lifecycle', () => {
    let createdDishId: string;
    const testDishPayload = {
      name: 'Paneer Butter Kulcha',
      description: 'Stuffed Indian flatbread with spiced paneer and butter glaze.',
      photo_url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/butter-chicken.jpg',
      price: 6.50,
      category: 'Breads',
      tags: ['breads', 'vegetarian'],
      daily_special: false,
      is_available: true,
      is_coming_soon: false,
    };

    it('POST /api/dishes creates a new dish and returns 201', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDishPayload),
      });

      assert.strictEqual(res.status, 201);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.dish_id || body.data?.dish_id);
      createdDishId = body.dish_id || body.data.dish_id;
      assert.strictEqual(body.name || body.data.name, testDishPayload.name);
      assert.strictEqual(body.price || body.data.price, testDishPayload.price);
    });

    it('GET /api/dishes/[id] retrieves newly created dish', async () => {
      assert.ok(createdDishId, 'Dish ID should be defined from POST');
      const res = await fetch(`${BASE_URL}/api/dishes/${createdDishId}`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      const dish = body.data || body;
      assert.strictEqual(dish.dish_id, createdDishId);
      assert.strictEqual(dish.name, testDishPayload.name);
      assert.strictEqual(dish.price, 6.50);
      assert.strictEqual(dish.daily_special, false);
      assert.strictEqual(dish.is_available, true);
    });

    it('PUT /api/dishes/[id] updates price and daily_special', async () => {
      const updatePayload = {
        price: 8.00,
        daily_special: true,
      };

      const res = await fetch(`${BASE_URL}/api/dishes/${createdDishId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      const updated = body.data || body;
      assert.strictEqual(updated.price, 8.00);
      assert.strictEqual(updated.daily_special, true);
    });

    it('GET /api/dishes/[id] verifies updated data is served', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes/${createdDishId}`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      const dish = body.data || body;
      assert.strictEqual(dish.price, 8.00);
      assert.strictEqual(dish.daily_special, true);
    });

    it('DELETE /api/dishes/[id] removes dish and subsequent GET returns 404', async () => {
      const deleteRes = await fetch(`${BASE_URL}/api/dishes/${createdDishId}`, {
        method: 'DELETE',
      });
      assert.strictEqual(deleteRes.status, 200);
      const deleteBody = await deleteRes.json();
      assert.strictEqual(deleteBody.success, true);

      // Verify subsequent GET returns 404
      const getRes = await fetch(`${BASE_URL}/api/dishes/${createdDishId}`);
      assert.strictEqual(getRes.status, 404);
      const getBody = await getRes.json();
      assert.strictEqual(getBody.success, false);
    });

    it('DELETE /api/dishes/[id] returns 404 for nonexistent dish', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes/non_existent_id_999`, {
        method: 'DELETE',
      });
      assert.strictEqual(res.status, 404);
    });
  });
});
