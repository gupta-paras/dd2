import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import {
  Dish,
  DishCreateInput,
  DishUpdateInput,
  DishFilterParams,
  DishListResponse,
} from '../db/schema';
import { getDatabase } from '../db/sqlite';

export interface IDishRepository {
  findAll(): Promise<Dish[]> | Dish[];
  findById(dishId: string): Promise<Dish | null> | Dish | null;
  create(input: DishCreateInput): Promise<Dish> | Dish;
  update(dishId: string, input: DishUpdateInput): Promise<Dish | null> | Dish | null;
  delete(dishId: string): Promise<boolean> | boolean;
  count(): Promise<number> | number;
}

interface DishDbRow {
  dish_id: string;
  name: string;
  description: string;
  photo_url: string;
  price: number;
  tags: string;
  daily_special: number;
  is_available: number;
  created_at: string;
  updated_at: string;
}

export function mapRowToDish(row: DishDbRow): Dish {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags);
  } catch {
    tags = typeof row.tags === 'string' ? row.tags.split(',').map((t) => t.trim()) : [];
  }

  return {
    dish_id: row.dish_id,
    name: row.name,
    description: row.description,
    photo_url: row.photo_url,
    price: Number(row.price),
    tags: Array.isArray(tags) ? tags : [],
    daily_special: row.daily_special === 1 || Boolean(row.daily_special),
    is_available: row.is_available === 1 || Boolean(row.is_available),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class SqliteDishRepository implements IDishRepository {
  private db: DatabaseSync;

  constructor(db?: DatabaseSync) {
    this.db = db || getDatabase();
  }

  findAll(): Dish[] {
    const rows = this.db.prepare('SELECT * FROM dishes ORDER BY created_at ASC').all() as unknown as DishDbRow[];
    return rows.map(mapRowToDish);
  }

  findById(dishId: string): Dish | null {
    const row = this.db.prepare('SELECT * FROM dishes WHERE dish_id = ?').get(dishId) as unknown as DishDbRow | undefined;
    if (!row) return null;
    return mapRowToDish(row);
  }

  create(input: DishCreateInput): Dish {
    const dish_id = input.dish_id || `dish_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
    const now = new Date().toISOString();
    const daily_special = input.daily_special ?? false;
    const is_available = input.is_available ?? true;
    const tagsJson = JSON.stringify(input.tags || []);

    const stmt = this.db.prepare(`
      INSERT INTO dishes (
        dish_id, name, description, photo_url, price, tags, daily_special, is_available, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      dish_id,
      input.name,
      input.description,
      input.photo_url,
      input.price,
      tagsJson,
      daily_special ? 1 : 0,
      is_available ? 1 : 0,
      now,
      now
    );

    return {
      dish_id,
      name: input.name,
      description: input.description,
      photo_url: input.photo_url,
      price: input.price,
      tags: input.tags,
      daily_special,
      is_available,
      created_at: now,
      updated_at: now,
    };
  }

  update(dishId: string, input: DishUpdateInput): Dish | null {
    const existing = this.findById(dishId);
    if (!existing) return null;

    const updatedDish: Dish = {
      dish_id: existing.dish_id,
      name: input.name !== undefined ? input.name : existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      photo_url: input.photo_url !== undefined ? input.photo_url : existing.photo_url,
      price: input.price !== undefined ? input.price : existing.price,
      tags: input.tags !== undefined ? input.tags : existing.tags,
      daily_special: input.daily_special !== undefined ? input.daily_special : existing.daily_special,
      is_available: input.is_available !== undefined ? input.is_available : existing.is_available,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE dishes SET
        name = ?,
        description = ?,
        photo_url = ?,
        price = ?,
        tags = ?,
        daily_special = ?,
        is_available = ?,
        updated_at = ?
      WHERE dish_id = ?
    `);

    stmt.run(
      updatedDish.name,
      updatedDish.description,
      updatedDish.photo_url,
      updatedDish.price,
      JSON.stringify(updatedDish.tags),
      updatedDish.daily_special ? 1 : 0,
      updatedDish.is_available ? 1 : 0,
      updatedDish.updated_at,
      dishId
    );

    return updatedDish;
  }

  delete(dishId: string): boolean {
    const result = this.db.prepare('DELETE FROM dishes WHERE dish_id = ?').run(dishId) as { changes?: number };
    return (result?.changes ?? 0) > 0;
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM dishes').get() as { count: number };
    return row.count;
  }
}

export class DishService {
  constructor(private readonly repository: IDishRepository = new SqliteDishRepository()) {}

  async getDishById(id: string): Promise<Dish | null> {
    return this.repository.findById(id);
  }

  async createDish(input: DishCreateInput): Promise<Dish> {
    return this.repository.create(input);
  }

  async updateDish(id: string, input: DishUpdateInput): Promise<Dish | null> {
    return this.repository.update(id, input);
  }

  async deleteDish(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  /**
   * Filter dishes using exact DESIGN.md specifications:
   * - availability (is_available): AND condition
   * - daily_special, tags, name: OR condition among themselves
   * 
   * Match(dish) = (availability == null OR dish.is_available == availability)
   *               AND
   *               (
   *                 No_OR_Filters_Provided
   *                 OR (daily_special != null AND dish.daily_special == daily_special)
   *                 OR (tags != null AND dish.tags intersects tags)
   *                 OR (name != null AND dish.name contains name)
   *               )
   */
  async getDishes(filters?: DishFilterParams): Promise<DishListResponse> {
    const allDishes = await this.repository.findAll();

    if (!filters) {
      return {
        success: true,
        count: allDishes.length,
        data: allDishes,
      };
    }

    // 1. Availability filter (evaluated via AND)
    const targetAvailability =
      filters.availability !== undefined
        ? filters.availability
        : filters.is_available !== undefined
        ? filters.is_available
        : undefined;

    // 2. OR filters group: daily_special, tags, name
    const hasDailySpecialFilter = filters.daily_special !== undefined;
    const targetDailySpecial = filters.daily_special;

    let targetTags: string[] = [];
    if (filters.tags !== undefined) {
      if (Array.isArray(filters.tags)) {
        targetTags = filters.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
      } else if (typeof filters.tags === 'string' && filters.tags.trim().length > 0) {
        targetTags = filters.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      }
    }
    const hasTagsFilter = targetTags.length > 0;

    const targetName = typeof filters.name === 'string' ? filters.name.trim().toLowerCase() : '';
    const hasNameFilter = targetName.length > 0;

    const hasOrFilters = hasDailySpecialFilter || hasTagsFilter || hasNameFilter;

    const filtered = allDishes.filter((dish) => {
      // AND evaluation for availability
      if (targetAvailability !== undefined && dish.is_available !== targetAvailability) {
        return false;
      }

      // If no OR filters are specified, pass immediately
      if (!hasOrFilters) {
        return true;
      }

      // OR evaluation among daily_special, tags, name
      if (hasDailySpecialFilter && dish.daily_special === targetDailySpecial) {
        return true;
      }

      if (hasTagsFilter) {
        const dishTags = dish.tags.map((t) => t.toLowerCase());
        if (targetTags.some((tag) => dishTags.includes(tag))) {
          return true;
        }
      }

      if (hasNameFilter) {
        if (dish.name.toLowerCase().includes(targetName)) {
          return true;
        }
      }

      return false;
    });

    return {
      success: true,
      count: filtered.length,
      data: filtered,
    };
  }
}

// Default singleton instance
let defaultDishService: DishService | null = null;

export function getDishService(db?: DatabaseSync): DishService {
  if (db) {
    return new DishService(new SqliteDishRepository(db));
  }
  if (!defaultDishService) {
    defaultDishService = new DishService();
  }
  return defaultDishService;
}
