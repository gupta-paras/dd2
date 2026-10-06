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
        ordering_notice: { ...DEFAULT_CONFIG.ordering_notice, ...parsed.ordering_notice },
        hero: { ...DEFAULT_CONFIG.hero, ...parsed.hero },
        menu_section: { ...DEFAULT_CONFIG.menu_section, ...parsed.menu_section },
        about: { ...DEFAULT_CONFIG.about, ...parsed.about },
        how_to_order: {
          eyebrow: parsed.how_to_order?.eyebrow || DEFAULT_CONFIG.how_to_order.eyebrow,
          eyebrow_nl: parsed.how_to_order?.eyebrow_nl || DEFAULT_CONFIG.how_to_order.eyebrow_nl,
          title: parsed.how_to_order?.title || DEFAULT_CONFIG.how_to_order.title,
          title_nl: parsed.how_to_order?.title_nl || DEFAULT_CONFIG.how_to_order.title_nl,
          steps: parsed.how_to_order?.steps || DEFAULT_CONFIG.how_to_order.steps,
        },
        occasions: { ...DEFAULT_CONFIG.occasions, ...parsed.occasions },
      };
      lastReadTime = now;
      return cachedConfig;
    }
  } catch (err) {
    console.error('Failed to parse config.yaml, using defaults:', err);
  }

  return DEFAULT_CONFIG;
}
