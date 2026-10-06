import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { NextRequest } from 'next/server';

import {
  initSchema,
  seedIfEmpty,
} from '../src/db/sqlite';
import { SEED_DISHES } from '../src/db/seed-data';
import {
  dishCreateSchema,
  dishUpdateSchema,
  dishFilterSchema,
} from '../src/services/dish.validator';
import {
  SqliteDishRepository,
  DishService,
} from '../src/services/dish.service';
import { GET as listDishesHandler, POST as createDishHandler } from '../src/app/api/dishes/route';
import {
  GET as getDishHandler,
  PUT as updateDishHandler,
  DELETE as deleteDishHandler,
} from '../src/app/api/dishes/[id]/route';

describe('Desi Dutch Backend Test Suite', () => {

  describe('1. Zod Validation Schemas (dish.validator.ts)', () => {
    it('accepts a valid dish creation payload', () => {
      const validPayload = {
        name: 'Butter Chicken Special',
        description: 'Tender chicken in rich creamy spiced gravy.',
        photo_url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/butter-chicken.jpg',
        price: 15.00,
        category: 'Curries',
        tags: ['curries', 'spicy'],
        daily_special: true,
        is_available: true,
        is_coming_soon: false,
      };

      const result = dishCreateSchema.safeParse(validPayload);
      assert.ok(result.success, 'Valid payload should parse successfully');
      if (result.success) {
        assert.strictEqual(result.data.name, 'Butter Chicken Special');
        assert.strictEqual(result.data.price, 15.00);
        assert.strictEqual(result.data.category, 'Curries');
        assert.deepStrictEqual(result.data.tags, ['curries', 'spicy']);
        assert.strictEqual(result.data.daily_special, true);
        assert.strictEqual(result.data.is_available, true);
        assert.strictEqual(result.data.is_coming_soon, false);
      }
    });

    it('accepts coming soon dishes with price 0.00', () => {
      const comingSoonPayload = {
        name: 'Masala Dosa',
        description: 'Crispy fermented rice and lentil crepe.',
        photo_url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/menu-masala-dosa.jpg',
        price: 0,
        category: 'South Indian',
        tags: ['south-indian', 'vegetarian'],
        is_coming_soon: true,
      };

      const result = dishCreateSchema.safeParse(comingSoonPayload);
      assert.ok(result.success, 'Coming soon with 0 price should be valid');
      if (result.success) {
        assert.strictEqual(result.data.price, 0);
        assert.strictEqual(result.data.is_coming_soon, true);
      }
    });

    it('sets default values for daily_special and is_available', () => {
      const payloadWithoutBooleans = {
        name: 'Lemon Rice',
        description: 'Fragrant basmati rice tempered with mustard seeds and lemon.',
        photo_url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/menu-lemon-rice.jpg',
        price: 12.00,
        tags: ['rice', 'vegetarian'],
      };

      const result = dishCreateSchema.safeParse(payloadWithoutBooleans);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.daily_special, false);
        assert.strictEqual(result.data.is_available, true);
        assert.strictEqual(result.data.is_coming_soon, false);
        assert.strictEqual(result.data.category, 'Curries'); // default category
      }
    });

    it('coerces string price and parses comma-separated tags', () => {
      const stringifiedPayload = {
        name: 'Samosa Duo',
        description: 'Crispy pastry shells with spiced potatoes.',
        photo_url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/samosa.jpg',
        price: '8.00',
        tags: 'snacks, vegetarian, spicy',
      };

      const result = dishCreateSchema.safeParse(stringifiedPayload);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.price, 8.00);
        assert.deepStrictEqual(result.data.tags, ['snacks', 'vegetarian', 'spicy']);
      }
    });

    it('rejects dish with negative price', () => {
      const negativePricePayload = {
        name: 'Bad Price Dish',
        description: 'Invalid price value',
        photo_url: 'https://example.com/photo.jpg',
        price: -5.00,
        tags: ['snack'],
      };

      const result = dishCreateSchema.safeParse(negativePricePayload);
      assert.strictEqual(result.success, false);
    });

    it('rejects dish with missing or invalid photo URL', () => {
      const badUrlPayload = {
        name: 'Bad URL Dish',
        description: 'Invalid URL',
        photo_url: 'not-a-valid-url',
        price: 5.00,
        tags: ['snack'],
      };

      const result = dishCreateSchema.safeParse(badUrlPayload);
      assert.strictEqual(result.success, false);
    });

    it('validates partial update inputs with dishUpdateSchema', () => {
      const updatePayload = {
        price: '18.50',
        daily_special: true,
      };

      const result = dishUpdateSchema.safeParse(updatePayload);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.price, 18.50);
        assert.strictEqual(result.data.daily_special, true);
      }
    });

    it('validates dishFilterSchema with string and boolean coercions', () => {
      const filterInput = {
        availability: 'true',
        daily_special: '1',
        category: 'curries',
        tags: 'vegetarian,spicy',
        name: 'biryani',
      };

      const result = dishFilterSchema.safeParse(filterInput);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.availability, true);
        assert.strictEqual(result.data.daily_special, true);
        assert.strictEqual(result.data.category, 'curries');
        assert.strictEqual(result.data.name, 'biryani');
      }
    });
  });

  describe('2. SQLite Database & Repository Operations', () => {
    let testDb: DatabaseSync;
    let repo: SqliteDishRepository;

    beforeEach(() => {
      testDb = new DatabaseSync(':memory:');
      initSchema(testDb);
      repo = new SqliteDishRepository(testDb);
    });

    it('initializes schema without errors on empty database', () => {
      const count = repo.count();
      assert.strictEqual(count, 0);
    });

    it('seeds full catalog dishes cleanly with seedIfEmpty', () => {
      const seeded = seedIfEmpty(testDb);
      assert.strictEqual(seeded, SEED_DISHES.length);
      assert.strictEqual(repo.count(), SEED_DISHES.length);

      // Second call should NOT duplicate
      const secondCall = seedIfEmpty(testDb);
      assert.strictEqual(secondCall, 0);
      assert.strictEqual(repo.count(), SEED_DISHES.length);
    });

    it('creates, reads, and finds a new dish', () => {
      const created = repo.create({
        name: 'Tandoori Paneer Tikka',
        description: 'Char-grilled cottage cheese with bell peppers.',
        photo_url: 'https://example.com/paneer.jpg',
        price: 13.50,
        category: 'Curries',
        tags: ['curries', 'vegetarian'],
        daily_special: true,
        is_available: true,
        is_coming_soon: false,
      });

      assert.ok(created.dish_id);
      assert.strictEqual(created.name, 'Tandoori Paneer Tikka');
      assert.strictEqual(created.price, 13.50);
      assert.strictEqual(created.category, 'Curries');
      assert.strictEqual(created.daily_special, true);

      const fetched = repo.findById(created.dish_id);
      assert.ok(fetched !== null);
      assert.strictEqual(fetched?.name, 'Tandoori Paneer Tikka');
      assert.strictEqual(fetched?.price, 13.50);
      assert.deepStrictEqual(fetched?.tags, ['curries', 'vegetarian']);
    });

    it('updates an existing dish', () => {
      const created = repo.create({
        name: 'Original Dish',
        description: 'Original description',
        photo_url: 'https://example.com/photo.jpg',
        price: 10.00,
        category: 'Rice',
        tags: ['rice'],
      });

      const updated = repo.update(created.dish_id, {
        name: 'Updated Dish',
        price: 15.00,
        daily_special: true,
        is_coming_soon: true,
      });

      assert.ok(updated !== null);
      assert.strictEqual(updated?.name, 'Updated Dish');
      assert.strictEqual(updated?.price, 15.00);
      assert.strictEqual(updated?.daily_special, true);
      assert.strictEqual(updated?.is_coming_soon, true);

      const reFetched = repo.findById(created.dish_id);
      assert.strictEqual(reFetched?.name, 'Updated Dish');
      assert.strictEqual(reFetched?.is_coming_soon, true);
    });

    it('deletes an existing dish', () => {
      const created = repo.create({
        name: 'To Delete',
        description: 'Will be removed',
        photo_url: 'https://example.com/del.jpg',
        price: 5.00,
        tags: ['temp'],
      });

      assert.strictEqual(repo.count(), 1);
      const deleted = repo.delete(created.dish_id);
      assert.strictEqual(deleted, true);
      assert.strictEqual(repo.count(), 0);
      assert.strictEqual(repo.findById(created.dish_id), null);
    });
  });

  describe('3. Compound Filtering Logic (DishService.getDishes)', () => {
    let service: DishService;

    beforeEach(() => {
      const testDb = new DatabaseSync(':memory:');
      initSchema(testDb);
      seedIfEmpty(testDb);
      service = new DishService(new SqliteDishRepository(testDb));
    });

    it('Scenario 0: No filters -> returns all catalog dishes', async () => {
      const result = await service.getDishes();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, SEED_DISHES.length);
      assert.strictEqual(result.data.length, SEED_DISHES.length);
    });

    it('Scenario 1: Availability filter only (AND logic)', async () => {
      const result = await service.getDishes({ availability: true });
      assert.strictEqual(result.success, true);
      const expectedCount = SEED_DISHES.filter((d) => d.is_available).length;
      assert.strictEqual(result.count, expectedCount);
      for (const dish of result.data) {
        assert.strictEqual(dish.is_available, true);
      }
    });

    it('Scenario 2: Daily special filter (OR group)', async () => {
      const result = await service.getDishes({ daily_special: true });
      assert.strictEqual(result.success, true);
      const expectedCount = SEED_DISHES.filter((d) => d.daily_special).length;
      assert.strictEqual(result.count, expectedCount);
      for (const dish of result.data) {
        assert.strictEqual(dish.daily_special, true);
      }
    });

    it('Scenario 3: Category filter -> ?category=Biryani', async () => {
      const result = await service.getDishes({ category: 'Biryani' });
      assert.strictEqual(result.success, true);
      assert.ok(result.count >= 1);
      for (const dish of result.data) {
        assert.strictEqual((dish.category || '').toLowerCase(), 'biryani');
      }
    });

    it('Scenario 4: Name substring filter -> ?name=Butter chicken', async () => {
      const result = await service.getDishes({ name: 'butter chicken' });
      assert.strictEqual(result.success, true);
      assert.ok(result.count >= 1);
      assert.ok(result.data[0].name.toLowerCase().includes('butter chicken'));
    });

    it('Scenario 5: Coming Soon filter -> ?is_coming_soon=true', async () => {
      const result = await service.getDishes({ is_coming_soon: true });
      assert.strictEqual(result.success, true);
      const expectedCount = SEED_DISHES.filter((d) => d.is_coming_soon).length;
      assert.strictEqual(result.count, expectedCount);
      for (const dish of result.data) {
        assert.strictEqual(dish.is_coming_soon, true);
      }
    });

    it('Scenario 6: Compound AND (availability) with OR (daily_special, category)', async () => {
      const result = await service.getDishes({
        availability: true,
        daily_special: true,
        category: 'Biryani',
      });

      assert.strictEqual(result.success, true);
      for (const dish of result.data) {
        assert.strictEqual(dish.is_available, true);
        const matchesOr = dish.daily_special || (dish.category || '').toLowerCase() === 'biryani';
        assert.ok(matchesOr);
      }
    });
  });

  describe('4. Next.js App Router API Route Handlers', () => {
    let testDb: DatabaseSync;

    beforeEach(() => {
      testDb = new DatabaseSync(':memory:');
      initSchema(testDb);
      seedIfEmpty(testDb);

      const insertStmt = testDb.prepare(`
        INSERT OR REPLACE INTO dishes (
          dish_id, name, description, photo_url, price, category, tags, daily_special, is_available, is_coming_soon, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const dish of SEED_DISHES) {
        insertStmt.run(
          dish.dish_id,
          dish.name,
          dish.description,
          dish.photo_url,
          dish.price,
          dish.category || 'Curries',
          JSON.stringify(dish.tags),
          dish.daily_special ? 1 : 0,
          dish.is_available ? 1 : 0,
          dish.is_coming_soon ? 1 : 0,
          dish.created_at,
          dish.updated_at
        );
      }
    });

    it('GET /api/dishes returns 200 with catalog dishes', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes');
      const res = await listDishesHandler(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.count >= 10);
      assert.ok(Array.isArray(json.data));
    });

    it('GET /api/dishes with ?availability=true returns 200 with available dishes', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes?availability=true');
      const res = await listDishesHandler(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      for (const dish of json.data) {
        assert.strictEqual(dish.is_available, true);
      }
    });

    it('POST /api/dishes creates a new dish and returns 201', async () => {
      const payload = {
        name: 'Gouda Samosa Chaat',
        description: 'Crispy samosa topped with Dutch Gouda cubes, sev, tamarind, and curd.',
        photo_url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/samosa.jpg',
        price: 9.95,
        category: 'Snacks',
        tags: ['snacks', 'vegetarian'],
        daily_special: false,
        is_available: true,
      };

      const req = new NextRequest('http://localhost:3000/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await createDishHandler(req);
      assert.strictEqual(res.status, 201);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.dish_id);
      assert.strictEqual(json.name, 'Gouda Samosa Chaat');
      assert.strictEqual(json.price, 9.95);

      // Verify it's in the database
      const getReq = new NextRequest(`http://localhost:3000/api/dishes/${json.dish_id}`);
      const getRes = await getDishHandler(getReq, { params: Promise.resolve({ id: json.dish_id }) });
      assert.strictEqual(getRes.status, 200);
      const getJson = await getRes.json();
      assert.strictEqual(getJson.name, 'Gouda Samosa Chaat');
    });

    it('POST /api/dishes returns 400 for validation errors', async () => {
      const invalidPayload = {
        name: '',
        price: -3.50,
      };

      const req = new NextRequest('http://localhost:3000/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      const res = await createDishHandler(req);
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.ok(json.details);
    });

    it('GET /api/dishes/[id] returns 200 for existing dish', async () => {
      const firstDish = SEED_DISHES[0];
      const req = new NextRequest(`http://localhost:3000/api/dishes/${firstDish.dish_id}`);
      const res = await getDishHandler(req, { params: Promise.resolve({ id: firstDish.dish_id }) });
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.dish_id, firstDish.dish_id);
      assert.strictEqual(json.name, firstDish.name);
    });

    it('GET /api/dishes/[id] returns 404 for non-existent dish', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes/dish_unknown_xyz');
      const res = await getDishHandler(req, { params: Promise.resolve({ id: 'dish_unknown_xyz' }) });
      assert.strictEqual(res.status, 404);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Dish not found');
    });

    it('PUT /api/dishes/[id] updates an existing dish and returns 200', async () => {
      // Create temporary dish to update
      const createReq = new NextRequest('http://localhost:3000/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Temp Dish for PUT test',
          photo_url: 'https://example.com/put-test.jpg',
          price: 12.00,
          category: 'Curries',
          tags: ['curries'],
        }),
      });
      const createRes = await createDishHandler(createReq);
      const createdData = await createRes.json();
      const tempDishId = createdData.data.dish_id;

      const updatePayload = {
        price: 19.50,
        daily_special: true,
      };

      const req = new NextRequest(`http://localhost:3000/api/dishes/${tempDishId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const res = await updateDishHandler(req, { params: Promise.resolve({ id: tempDishId }) });
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.price, 19.50);
      assert.strictEqual(json.daily_special, true);
    });

    it('DELETE /api/dishes/[id] removes dish and subsequent GET returns 404', async () => {
      // Create temporary dish to delete
      const createReq = new NextRequest('http://localhost:3000/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Temp Dish for DELETE test',
          photo_url: 'https://example.com/delete-test.jpg',
          price: 10.00,
          category: 'Curries',
          tags: ['curries'],
        }),
      });
      const createRes = await createDishHandler(createReq);
      const createdData = await createRes.json();
      const tempDishId = createdData.data.dish_id;

      const deleteReq = new NextRequest(`http://localhost:3000/api/dishes/${tempDishId}`, {
        method: 'DELETE',
      });

      const deleteRes = await deleteDishHandler(deleteReq, { params: Promise.resolve({ id: tempDishId }) });
      assert.strictEqual(deleteRes.status, 200);

      const json = await deleteRes.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.dish_id, tempDishId);
      assert.strictEqual(json.message, 'Dish deleted successfully');

      // Subsequent GET should return 404
      const getReq = new NextRequest(`http://localhost:3000/api/dishes/${tempDishId}`);
      const getRes = await getDishHandler(getReq, { params: Promise.resolve({ id: tempDishId }) });
      assert.strictEqual(getRes.status, 404);
    });
  });
});
