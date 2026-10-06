import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { DEFAULT_CONFIG, RestaurantConfig } from './config-shared';

export * from './config-shared';

let cachedConfig: RestaurantConfig | null = null;
let lastReadTime = 0;
const CACHE_TTL_MS = 2000;

export function getRestaurantConfig(): RestaurantConfig {
  const now = Date.now();
  if (cachedConfig && now - lastReadTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const configPath = path.join(process.cwd(), 'config.yaml');
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const parsed = YAML.parse(fileContent) as Partial<RestaurantConfig>;
      cachedConfig = {
        restaurant: { ...DEFAULT_CONFIG.restaurant, ...parsed.restaurant },
        address: { ...DEFAULT_CONFIG.address, ...parsed.address },
        timings: { ...DEFAULT_CONFIG.timings, ...parsed.timings },
        delivery: { ...DEFAULT_CONFIG.delivery, ...parsed.delivery },
        features: parsed.features || DEFAULT_CONFIG.features,
      };
      lastReadTime = now;
      return cachedConfig;
    }
  } catch (err) {
    console.error('Failed to parse config.yaml, using defaults:', err);
  }

  return DEFAULT_CONFIG;
}
