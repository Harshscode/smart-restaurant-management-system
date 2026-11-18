
import { z } from 'zod';

const categories = z.enum([
  'Starters',
  'Mains',
  'Desserts',
  'Beverages',
]);

const text = z.string().trim().min(1).max(500);

const textArray = z.array(
  z.string().trim().min(1).max(100)
).max(30);

const menuFields = {
  name: z.string().trim().min(2).max(100),
  category: categories,
  description: text,
  price: z.number().finite().min(0.01).max(10000),
  ingredients: textArray,
  allergens: textArray,
  dietary: textArray,
  available: z.boolean(),
  popular: z.boolean(),
  featured: z.boolean(),
  heat: z.number().int().min(0).max(3),
  image: z.string().trim().max(2000),
};

export const createMenuSchema = z.object({
  ...menuFields,
  ingredients: textArray.default([]),
  allergens: textArray.default([]),
  dietary: textArray.default([]),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  featured: z.boolean().default(false),
  heat: z.number().int().min(0).max(3).default(0),
  image: z.string().trim().max(2000).default(''),
}).strict();

export const updateMenuSchema = z.object(
  menuFields
).partial().strict().refine(
  data => Object.keys(data).length > 0,
  'Provide at least one field to update.'
);

export const menuQuerySchema = z.object({
  category: categories.optional(),
  available: z.enum(['true', 'false']).optional(),
  search: z.string().trim().max(80).optional(),
}).strict();
