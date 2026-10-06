import { DatabaseSync } from 'node:sqlite';
import { getDatabase, initSchema, seedIfEmpty } from './sqlite';
import { SEED_DISHES } from './seed-data';

export function seedDatabase(db?: DatabaseSync, force = false): { count: number; seeded: boolean } {
  const database = db || getDatabase();
  initSchema(database);

  if (force) {
    database.exec('DELETE FROM dishes;');
    const insertStmt = database.prepare(`
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
    return { count: SEED_DISHES.length, seeded: true };
  }

  const seededCount = seedIfEmpty(database);
  const totalRow = database.prepare('SELECT COUNT(*) as count FROM dishes').get() as { count: number };
  return { count: totalRow.count, seeded: seededCount > 0 };
}

// If executed directly from command line
if (typeof process !== 'undefined' && process.argv[1]?.replace(/\\/g, '/').endsWith('src/db/seed.ts')) {
  console.log('Seeding Desi Dutch database...');
  const result = seedDatabase(undefined, true);
  console.log(`Successfully seeded ${result.count} dishes!`);
}
