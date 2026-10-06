import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { NextRequest } from 'next/server';

import {
  getDatabase,
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
        name: 'Roti Bitterballen',
        description: 'Spiced potato and roti dough croquette with duck sauce.',
        photo_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270',
        price: 9.50,
        tags: ['snack', 'fusion'],
        daily_special: false,
        is_available: true,
      };

      const result = dishCreateSchema.safeParse(validPayload);
      assert.ok(result.success, 'Valid payload should parse successfully');
      if (result.success) {
        assert.strictEqual(result.data.name, 'Roti Bitterballen');
        assert.strictEqual(result.data.price, 9.50);
        assert.deepStrictEqual(result.data.tags, ['snack', 'fusion']);
        assert.strictEqual(result.data.daily_special, false);
        assert.strictEqual(result.data.is_available, true);
      }
    });

    it('sets default values for daily_special and is_available', () => {
      const payloadWithoutBooleans = {
        name: 'Paneer Friet',
        description: 'Fries with cottage cheese cubes and makhani drizzle.',
        photo_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
        price: 8.00,
        tags: ['vegetarian'],
      };

      const result = dishCreateSchema.safeParse(payloadWithoutBooleans);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.daily_special, false);
        assert.strictEqual(result.data.is_available, true);
      }
    });

    it('coerces string price and parses comma-separated tags', () => {
      const stringifiedPayload = {
        name: 'Dutch Samosa',
        description: 'Gouda filled triangular pastry.',
        photo_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
        price: '7.50',
        tags: 'snack, cheese, spicy',
      };

      const result = dishCreateSchema.safeParse(stringifiedPayload);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.price, 7.50);
        assert.deepStrictEqual(result.data.tags, ['snack', 'cheese', 'spicy']);
      }
    });

    it('rejects missing or empty name', () => {
      const payload = {
        name: '   ',
        description: 'Valid description',
        photo_url: 'https://example.com/photo.jpg',
        price: 10,
        tags: ['snack'],
      };

      const result = dishCreateSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    it('rejects name longer than 120 characters', () => {
      const payload = {
        name: 'A'.repeat(121),
        description: 'Valid description',
        photo_url: 'https://example.com/photo.jpg',
        price: 10,
        tags: ['snack'],
      };

      const result = dishCreateSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    it('rejects description longer than 500 characters', () => {
      const payload = {
        name: 'Valid Name',
        description: 'B'.repeat(501),
        photo_url: 'https://example.com/photo.jpg',
        price: 10,
        tags: ['snack'],
      };

      const result = dishCreateSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    it('rejects negative or zero price', () => {
      const zeroPrice = {
        name: 'Free Food',
        description: 'Valid description',
        photo_url: 'https://example.com/photo.jpg',
        price: 0,
        tags: ['snack'],
      };

      const negativePrice = {
        ...zeroPrice,
        price: -5.50,
      };

      assert.strictEqual(dishCreateSchema.safeParse(zeroPrice).success, false);
      assert.strictEqual(dishCreateSchema.safeParse(negativePrice).success, false);
    });

    it('rejects invalid photo URL', () => {
      const payload = {
        name: 'Valid Name',
        description: 'Valid description',
        photo_url: 'not-a-valid-url',
        price: 10,
        tags: ['snack'],
      };

      const result = dishCreateSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    it('rejects empty tags list', () => {
      const payload = {
        name: 'Valid Name',
        description: 'Valid description',
        photo_url: 'https://example.com/photo.jpg',
        price: 10,
        tags: [],
      };

      const result = dishCreateSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    it('validates dish update schema allowing partial fields', () => {
      const partialUpdate = { price: 12.00, is_available: false };
      const result = dishUpdateSchema.safeParse(partialUpdate);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.price, 12.00);
        assert.strictEqual(result.data.is_available, false);
      }
    });

    it('rejects invalid price in update schema', () => {
      const invalidUpdate = { price: -2.00 };
      const result = dishUpdateSchema.safeParse(invalidUpdate);
      assert.strictEqual(result.success, false);
    });

    it('parses filter query parameters correctly', () => {
      const rawFilters = {
        availability: 'true',
        daily_special: 'false',
        tags: 'snack,spicy',
        name: 'kapsalon',
      };

      const result = dishFilterSchema.safeParse(rawFilters);
      assert.ok(result.success);
      if (result.success) {
        assert.strictEqual(result.data.availability, true);
        assert.strictEqual(result.data.daily_special, false);
        assert.strictEqual(result.data.tags, 'snack,spicy');
        assert.strictEqual(result.data.name, 'kapsalon');
      }
    });
  });

  describe('2. Database Layer & Repository (sqlite.ts & SqliteDishRepository)', () => {
    let testDb: DatabaseSync;
    let repo: SqliteDishRepository;

    beforeEach(() => {
      testDb = new DatabaseSync(':memory:');
      initSchema(testDb);
      repo = new SqliteDishRepository(testDb);
    });

    it('initializes schema and tables successfully', () => {
      const count = repo.count();
      assert.strictEqual(count, 0);
    });

    it('seeds exactly 10 dishes when seedIfEmpty is called', () => {
      const seededCount = seedIfEmpty(testDb);
      assert.strictEqual(seededCount, 10);
      assert.strictEqual(repo.count(), 10);

      // Verify seed distribution
      const dishes = repo.findAll();
      const specials = dishes.filter((d) => d.daily_special);
      const available = dishes.filter((d) => d.is_available);
      const unavailable = dishes.filter((d) => !d.is_available);

      assert.strictEqual(specials.length, 3, 'Exactly 3 daily specials in seed data');
      assert.strictEqual(available.length, 8, 'Exactly 8 available dishes in seed data');
      assert.strictEqual(unavailable.length, 2, 'Exactly 2 unavailable dishes in seed data');
    });

    it('does not re-seed if dishes table is not empty', () => {
      seedIfEmpty(testDb);
      const secondCall = seedIfEmpty(testDb);
      assert.strictEqual(secondCall, 0);
      assert.strictEqual(repo.count(), 10);
    });

    it('creates a new dish and retrieves it by id', () => {
      const created = repo.create({
        name: 'Test Fusion Bowl',
        description: 'A great fusion test bowl.',
        photo_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270',
        price: 11.50,
        tags: ['fusion', 'test'],
        daily_special: true,
        is_available: true,
      });

      assert.ok(created.dish_id.startsWith('dish_'));
      assert.strictEqual(created.name, 'Test Fusion Bowl');
      assert.strictEqual(created.price, 11.50);
      assert.strictEqual(created.daily_special, true);
      assert.strictEqual(created.is_available, true);

      const retrieved = repo.findById(created.dish_id);
      assert.ok(retrieved !== null);
      assert.strictEqual(retrieved?.name, 'Test Fusion Bowl');
      assert.deepStrictEqual(retrieved?.tags, ['fusion', 'test']);
    });

    it('returns null when dish id is not found', () => {
      const retrieved = repo.findById('non_existent_id');
      assert.strictEqual(retrieved, null);
    });

    it('updates an existing dish', () => {
      const created = repo.create({
        name: 'Original Dish',
        description: 'Original description',
        photo_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270',
        price: 10.00,
        tags: ['original'],
      });

      const updated = repo.update(created.dish_id, {
        name: 'Updated Dish',
        price: 15.00,
        daily_special: true,
      });

      assert.ok(updated !== null);
      assert.strictEqual(updated?.name, 'Updated Dish');
      assert.strictEqual(updated?.price, 15.00);
      assert.strictEqual(updated?.daily_special, true);
      assert.strictEqual(updated?.description, 'Original description');

      const reFetched = repo.findById(created.dish_id);
      assert.strictEqual(reFetched?.name, 'Updated Dish');
    });

    it('returns null when updating non-existent dish', () => {
      const updated = repo.update('fake_id', { name: 'New Name' });
      assert.strictEqual(updated, null);
    });

    it('deletes an existing dish', () => {
      const created = repo.create({
        name: 'To Delete',
        description: 'Will be removed',
        photo_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270',
        price: 5.00,
        tags: ['temp'],
      });

      assert.strictEqual(repo.count(), 1);
      const deleted = repo.delete(created.dish_id);
      assert.strictEqual(deleted, true);
      assert.strictEqual(repo.count(), 0);
      assert.strictEqual(repo.findById(created.dish_id), null);
    });

    it('returns false when deleting non-existent dish', () => {
      const deleted = repo.delete('fake_id');
      assert.strictEqual(deleted, false);
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

    it('Scenario 0: No filters -> returns all 10 dishes', async () => {
      const result = await service.getDishes();
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 10);
      assert.strictEqual(result.data.length, 10);
    });

    it('Scenario 1: Availability filter only (AND logic) -> ?availability=true returns 8 available dishes', async () => {
      const result = await service.getDishes({ availability: true });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 8);
      for (const dish of result.data) {
        assert.strictEqual(dish.is_available, true, `${dish.name} must be available`);
      }
    });

    it('Scenario 1b: Availability filter only (AND logic) -> ?availability=false returns 2 unavailable dishes', async () => {
      const result = await service.getDishes({ availability: false });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 2);
      for (const dish of result.data) {
        assert.strictEqual(dish.is_available, false, `${dish.name} must be unavailable`);
      }
      const names = result.data.map((d) => d.name);
      assert.ok(names.includes('Tandoori Haring Slider'));
      assert.ok(names.includes('Biryani Bitterballen'));
    });

    it('Scenario 1c: Supports alternate parameter name is_available', async () => {
      const result = await service.getDishes({ is_available: true });
      assert.strictEqual(result.count, 8);
    });

    it('Scenario 2: OR filter only -> ?daily_special=true returns 3 daily specials', async () => {
      const result = await service.getDishes({ daily_special: true });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 3);
      for (const dish of result.data) {
        assert.strictEqual(dish.daily_special, true);
      }
    });

    it('Scenario 2b: OR filter only -> ?tags=snack returns snack dishes', async () => {
      const result = await service.getDishes({ tags: 'snack' });
      assert.strictEqual(result.success, true);
      // Let's verify each returned dish has 'snack' tag
      for (const dish of result.data) {
        assert.ok(
          dish.tags.map((t) => t.toLowerCase()).includes('snack'),
          `${dish.name} must have tag 'snack'`
        );
      }
      // Keema Bitterballen, Paneer & Gouda Kroket, Tandoori Haring Slider, Biryani Bitterballen
      assert.strictEqual(result.count, 4);
    });

    it('Scenario 2c: OR filter only -> ?name=Kapsalon matches case-insensitive substring', async () => {
      const result = await service.getDishes({ name: 'kapsalon' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.data[0].name, 'Kapsalon Chicken Tikka');
    });

    it('Scenario 3: OR filter combination among themselves: ?tags=dessert&name=wafel', async () => {
      // Matches dishes where (tag is dessert OR name contains wafel)
      const result = await service.getDishes({ tags: 'dessert', name: 'wafel' });
      assert.strictEqual(result.success, true);
      // Desserts: Masala Stroopwafel, Gulab Jamun Poffertjes, Mango Lassi Dutch Waffle
      // Name contains 'wafel': Masala Stroopwafel, Mango Lassi Dutch Waffle
      // Union is all 3 desserts
      assert.strictEqual(result.count, 3);
      for (const dish of result.data) {
        const hasDessert = dish.tags.includes('dessert');
        const hasWafel = dish.name.toLowerCase().includes('wafel');
        assert.ok(hasDessert || hasWafel, `${dish.name} must match tag dessert or name wafel`);
      }
    });

    it('Scenario 4: Compound AND + OR logic: ?availability=true&tags=snack&daily_special=true', async () => {
      // Dish must be available AND (daily_special=true OR tags includes 'snack')
      const result = await service.getDishes({
        availability: true,
        tags: 'snack',
        daily_special: true,
      });

      assert.strictEqual(result.success, true);
      for (const dish of result.data) {
        // Must satisfy availability AND
        assert.strictEqual(dish.is_available, true, `${dish.name} must be available`);
        // Must satisfy OR group
        const isSpecial = dish.daily_special === true;
        const isSnack = dish.tags.map((t) => t.toLowerCase()).includes('snack');
        assert.ok(isSpecial || isSnack, `${dish.name} must be a daily special or a snack`);
      }

      // Check exclusion: Biryani Bitterballen (has tag 'snack', but is_available is false) MUST BE EXCLUDED!
      const dishNames = result.data.map((d) => d.name);
      assert.ok(!dishNames.includes('Biryani Bitterballen'), 'Unavailable snack must be excluded');
      assert.ok(!dishNames.includes('Tandoori Haring Slider'), 'Unavailable slider must be excluded');
    });

    it('Scenario 5: Availability false AND tag snack: ?availability=false&tags=snack', async () => {
      const result = await service.getDishes({
        availability: false,
        tags: 'snack',
      });

      assert.strictEqual(result.success, true);
      // Both unavailable dishes (Tandoori Haring Slider, Biryani Bitterballen) have the tag 'snack'
      assert.strictEqual(result.count, 2);
      for (const dish of result.data) {
        assert.strictEqual(dish.is_available, false);
        assert.ok(dish.tags.includes('snack'));
      }
    });

    it('Scenario 6: Availability false AND daily_special true: ?availability=false&daily_special=true', async () => {
      // None of the unavailable dishes are daily specials in the seed data
      const result = await service.getDishes({
        availability: false,
        daily_special: true,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 0);
      assert.deepStrictEqual(result.data, []);
    });

    it('Scenario 7: Non-matching name query returns empty result', async () => {
      const result = await service.getDishes({ name: 'Sushi Burrito Roll' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.count, 0);
      assert.deepStrictEqual(result.data, []);
    });
  });

  describe('4. REST API Route Handlers (/api/dishes & /api/dishes/[id])', () => {
    beforeEach(() => {
      // Ensure default database has clean seed data for API routes
      const db = getDatabase();
      db.exec('DELETE FROM dishes;');
      const insertStmt = db.prepare(`
        INSERT INTO dishes (
          dish_id, name, description, photo_url, price, tags, daily_special, is_available, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const dish of SEED_DISHES) {
        insertStmt.run(
          dish.dish_id,
          dish.name,
          dish.description,
          dish.photo_url,
          dish.price,
          JSON.stringify(dish.tags),
          dish.daily_special ? 1 : 0,
          dish.is_available ? 1 : 0,
          dish.created_at,
          dish.updated_at
        );
      }
    });

    it('GET /api/dishes returns 200 with all 10 dishes', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes');
      const res = await listDishesHandler(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.count, 10);
      assert.strictEqual(json.data.length, 10);
    });

    it('GET /api/dishes with ?availability=true returns 200 with 8 dishes', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes?availability=true');
      const res = await listDishesHandler(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.count, 8);
      for (const dish of json.data) {
        assert.strictEqual(dish.is_available, true);
      }
    });

    it('GET /api/dishes with compound query ?availability=true&daily_special=true&tags=snack', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes?availability=true&daily_special=true&tags=snack');
      const res = await listDishesHandler(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      for (const dish of json.data) {
        assert.strictEqual(dish.is_available, true);
      }
      const names = json.data.map((d: { name: string }) => d.name);
      assert.ok(!names.includes('Biryani Bitterballen'));
    });

    it('POST /api/dishes creates a new dish and returns 201', async () => {
      const payload = {
        name: 'Gouda Samosa Chaat',
        description: 'Crispy samosa topped with Dutch Gouda cubes, sev, tamarind, and curd.',
        photo_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270',
        price: 9.95,
        tags: ['snack', 'vegetarian', 'cheese'],
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

      // Verify it's now in the database
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
        // missing photo_url, description, tags
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

    it('POST /api/dishes returns 400 for invalid JSON body', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-non-json-body',
      });

      const res = await createDishHandler(req);
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
    });

    it('GET /api/dishes/[id] returns 200 for existing dish', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes/dish_01');
      const res = await getDishHandler(req, { params: Promise.resolve({ id: 'dish_01' }) });
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.dish_id, 'dish_01');
      assert.strictEqual(json.name, 'Keema Bitterballen with Mint Mayo');
    });

    it('GET /api/dishes/[id] returns 404 for non-existent dish', async () => {
      const req = new NextRequest('http://localhost:3000/api/dishes/dish_unknown');
      const res = await getDishHandler(req, { params: Promise.resolve({ id: 'dish_unknown' }) });
      assert.strictEqual(res.status, 404);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Dish not found');
    });

    it('PUT /api/dishes/[id] updates an existing dish and returns 200', async () => {
      const updatePayload = {
        price: 14.95,
        daily_special: false,
      };

      const req = new NextRequest('http://localhost:3000/api/dishes/dish_02', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const res = await updateDishHandler(req, { params: Promise.resolve({ id: 'dish_02' }) });
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.price, 14.95);
      assert.strictEqual(json.daily_special, false);
      assert.strictEqual(json.name, 'Kapsalon Chicken Tikka');
    });

    it('PUT /api/dishes/[id] returns 400 for invalid update payload', async () => {
      const invalidUpdate = {
        price: -10,
      };

      const req = new NextRequest('http://localhost:3000/api/dishes/dish_02', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUpdate),
      });

      const res = await updateDishHandler(req, { params: Promise.resolve({ id: 'dish_02' }) });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
    });

    it('PUT /api/dishes/[id] returns 404 for non-existent dish', async () => {
      const updatePayload = { price: 10 };
      const req = new NextRequest('http://localhost:3000/api/dishes/dish_missing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const res = await updateDishHandler(req, { params: Promise.resolve({ id: 'dish_missing' }) });
      assert.strictEqual(res.status, 404);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Dish not found');
    });

    it('DELETE /api/dishes/[id] removes dish and subsequent GET returns 404', async () => {
      const deleteReq = new NextRequest('http://localhost:3000/api/dishes/dish_03', {
        method: 'DELETE',
      });

      const deleteRes = await deleteDishHandler(deleteReq, { params: Promise.resolve({ id: 'dish_03' }) });
      assert.strictEqual(deleteRes.status, 200);

      const json = await deleteRes.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.dish_id, 'dish_03');
      assert.strictEqual(json.message, 'Dish deleted successfully');

      // Subsequent GET should return 404
      const getReq = new NextRequest('http://localhost:3000/api/dishes/dish_03');
      const getRes = await getDishHandler(getReq, { params: Promise.resolve({ id: 'dish_03' }) });
      assert.strictEqual(getRes.status, 404);
    });

    it('DELETE /api/dishes/[id] returns 404 for non-existent dish', async () => {
      const deleteReq = new NextRequest('http://localhost:3000/api/dishes/dish_nonexistent', {
        method: 'DELETE',
      });

      const deleteRes = await deleteDishHandler(deleteReq, { params: Promise.resolve({ id: 'dish_nonexistent' }) });
      assert.strictEqual(deleteRes.status, 404);

      const json = await deleteRes.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Dish not found');
    });
  });
});
