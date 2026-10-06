import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { SEED_DISHES } from './seed-data';

let defaultDbInstance: DatabaseSync | null = null;

export function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS dishes (
      dish_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_nl TEXT,
      description TEXT NOT NULL,
      description_nl TEXT,
      photo_url TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL DEFAULT 'Curries',
      tags TEXT NOT NULL,
      daily_special INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1,
      is_coming_soon INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  try {
    db.exec(`ALTER TABLE dishes ADD COLUMN category TEXT NOT NULL DEFAULT 'Curries';`);
  } catch {}
  try {
    db.exec(`ALTER TABLE dishes ADD COLUMN is_coming_soon INTEGER NOT NULL DEFAULT 0;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE dishes ADD COLUMN name_nl TEXT;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE dishes ADD COLUMN description_nl TEXT;`);
  } catch {}

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dishes_name ON dishes(name);
    CREATE INDEX IF NOT EXISTS idx_dishes_daily_special ON dishes(daily_special);
    CREATE INDEX IF NOT EXISTS idx_dishes_is_available ON dishes(is_available);
    CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
    CREATE INDEX IF NOT EXISTS idx_dishes_coming_soon ON dishes(is_coming_soon);
  `);
}

export function seedIfEmpty(db: DatabaseSync): number {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM dishes').get() as { count: number };
  if (countRow.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO dishes (
        dish_id, name, name_nl, description, description_nl, photo_url, price, category, tags, daily_special, is_available, is_coming_soon, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const dish of SEED_DISHES) {
      insertStmt.run(
        dish.dish_id,
        dish.name,
        dish.name_nl || dish.name,
        dish.description,
        dish.description_nl || dish.description,
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
    return SEED_DISHES.length;
  }
  return 0;
}

export function createDatabase(dbPath?: string, options: { autoSeed?: boolean } = { autoSeed: true }): DatabaseSync {
  const resolvedPath = dbPath || process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data.db');
  
  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(resolvedPath);

  if (resolvedPath !== ':memory:') {
    try {
      db.exec('PRAGMA journal_mode = WAL;');
    } catch {
      // WAL may not be supported in some environments, ignore gracefully
    }
  }
  db.exec('PRAGMA synchronous = NORMAL;');

  initSchema(db);

  if (options.autoSeed !== false) {
    seedIfEmpty(db);
  }

  return db;
}

export function getDatabase(customPath?: string): DatabaseSync {
  if (customPath) {
    return createDatabase(customPath);
  }
  if (!defaultDbInstance) {
    defaultDbInstance = createDatabase();
  }
  return defaultDbInstance;
}

export function closeDatabase(): void {
  if (defaultDbInstance) {
    defaultDbInstance.close();
    defaultDbInstance = null;
  }
}
