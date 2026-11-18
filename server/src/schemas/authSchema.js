
import { z } from 'zod';

const email = z.string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const password = z.string()
  .min(12, 'Password must contain at least 12 characters.')
  .refine(
    value => Buffer.byteLength(value, 'utf8') <= 72,
    'Password is too long.'
  );

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
  phone: z.string().trim().max(25).optional().default(''),
}).strict();

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
}).strict();
