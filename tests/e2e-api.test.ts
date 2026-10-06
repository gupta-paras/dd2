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
      assert.ok(data.count >= 10, `Expected at least 10 dishes, got ${data.count}`);
    });

    it('GET /dishes (rewritten endpoint) returns identical 200 structure', async () => {
      const res = await fetch(`${BASE_URL}/dishes`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.count >= 10);
    });

    it('Verifies initial bootstrapped dish data structures', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes`);
      const data = await res.json();
      const dishes: Dish[] = data.data;

      const keema = dishes.find((d: Dish) => d.name.includes('Keema Bitterballen'));
      assert.ok(keema, 'Keema Bitterballen should exist');
      assert.strictEqual(keema.daily_special, true);
      assert.strictEqual(keema.is_available, true);
      assert.strictEqual(keema.price, 8.5);

      const kapsalon = dishes.find((d: Dish) => d.name.includes('Kapsalon Chicken Tikka'));
      assert.ok(kapsalon, 'Kapsalon Chicken Tikka should exist');
      assert.strictEqual(kapsalon.daily_special, true);
      assert.strictEqual(kapsalon.is_available, true);
      assert.strictEqual(kapsalon.price, 13.5);
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

    it('Filter: availability=false (AND condition)', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?availability=false`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length > 0);
      for (const dish of data.data) {
        assert.strictEqual(dish.is_available, false, `Dish ${dish.name} should be unavailable`);
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

    it('Filter: tags=snack (OR condition)', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?tags=snack`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length > 0);
      for (const dish of data.data) {
        const lowerTags = dish.tags.map((t: string) => t.toLowerCase());
        assert.ok(lowerTags.includes('snack'), `Dish ${dish.name} must contain snack tag`);
      }
    });

    it('Filter: name=kapsalon (OR condition)', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?name=kapsalon`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length >= 1);
      for (const dish of data.data) {
        assert.ok(
          dish.name.toLowerCase().includes('kapsalon'),
          `Dish ${dish.name} should match kapsalon substring`
        );
      }
    });

    it('Compound Filter: availability=true & daily_special=true & tags=snack (AND with OR)', async () => {
      const res = await fetch(
        `${BASE_URL}/api/dishes?availability=true&daily_special=true&tags=snack`
      );
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.length > 0);
      for (const dish of data.data) {
        assert.strictEqual(dish.is_available, true, `Dish ${dish.name} must be available`);
        const isSpecial = dish.daily_special === true;
        const hasSnack = dish.tags.map((t: string) => t.toLowerCase()).includes('snack');
        assert.ok(
          isSpecial || hasSnack,
          `Dish ${dish.name} must be either a daily special OR have tag snack`
        );
      }
    });

    it('Compound Filter: availability=false & name=kapsalon', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes?availability=false&name=kapsalon`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      // In the seed dataset, Kapsalon is available: true, so availability=false & name=kapsalon returns 0
      for (const dish of data.data) {
        assert.strictEqual(dish.is_available, false);
        assert.ok(dish.name.toLowerCase().includes('kapsalon'));
      }
    });
  });

  describe('3. REST API CRUD Mutations Lifecycle', () => {
    let createdDishId: string;
    const testDishPayload = {
      name: 'Tandoori Gouda Bitterballen',
      description: 'Crisp bitterballen infused with Dutch Gouda and smoked tandoori spices.',
      photo_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270',
      price: 9.75,
      tags: ['snack', 'fusion', 'cheese', 'spicy'],
      daily_special: false,
      is_available: true,
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
      assert.strictEqual(dish.price, 9.75);
      assert.strictEqual(dish.daily_special, false);
      assert.strictEqual(dish.is_available, true);
    });

    it('PUT /api/dishes/[id] updates price and daily_special', async () => {
      const updatePayload = {
        price: 11.5,
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
      assert.strictEqual(updated.price, 11.5);
      assert.strictEqual(updated.daily_special, true);
    });

    it('GET /api/dishes/[id] verifies updated data is served', async () => {
      const res = await fetch(`${BASE_URL}/api/dishes/${createdDishId}`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      const dish = body.data || body;
      assert.strictEqual(dish.price, 11.5);
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
