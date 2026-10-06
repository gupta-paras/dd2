import { z } from 'zod';

const parseBooleanValue = (val: unknown): boolean | undefined => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  return undefined;
};

const priceSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return isNaN(num) ? val : num;
  }
  return val;
}, z.number({ message: 'Price must be a valid number' }).min(0.01, 'Price must be at least 0.01 EUR'));

const tagsCreateSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return val;
}, z.array(z.string().trim().min(1, 'Tag cannot be empty')).min(1, 'At least one tag is required'));

const tagsUpdateSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return val;
}, z.array(z.string().trim().min(1, 'Tag cannot be empty')).min(1, 'At least one tag is required')).optional();

export const dishCreateSchema = z.object({
  dish_id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name must be at most 120 characters'),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description must be at most 500 characters'),
  photo_url: z.string().trim().url('Photo URL must be a valid URL'),
  price: priceSchema,
  tags: tagsCreateSchema,
  daily_special: z.preprocess((val) => {
    if (val === undefined || val === null) return false;
    const parsed = parseBooleanValue(val);
    return parsed !== undefined ? parsed : val;
  }, z.boolean()).default(false),
  is_available: z.preprocess((val) => {
    if (val === undefined || val === null) return true;
    const parsed = parseBooleanValue(val);
    return parsed !== undefined ? parsed : val;
  }, z.boolean()).default(true),
});

export const dishUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').max(120, 'Name must be at most 120 characters').optional(),
  description: z.string().trim().min(1, 'Description cannot be empty').max(500, 'Description must be at most 500 characters').optional(),
  photo_url: z.string().trim().url('Photo URL must be a valid URL').optional(),
  price: priceSchema.optional(),
  tags: tagsUpdateSchema,
  daily_special: z.preprocess((val) => {
    if (val === undefined) return undefined;
    return parseBooleanValue(val);
  }, z.boolean().optional()),
  is_available: z.preprocess((val) => {
    if (val === undefined) return undefined;
    return parseBooleanValue(val);
  }, z.boolean().optional()),
});

export const dishFilterSchema = z.object({
  availability: z.preprocess(parseBooleanValue, z.boolean().optional()),
  is_available: z.preprocess(parseBooleanValue, z.boolean().optional()),
  daily_special: z.preprocess(parseBooleanValue, z.boolean().optional()),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  name: z.string().optional(),
});

export type ValidatedDishCreate = z.infer<typeof dishCreateSchema>;
export type ValidatedDishUpdate = z.infer<typeof dishUpdateSchema>;
export type ValidatedDishFilter = z.infer<typeof dishFilterSchema>;
