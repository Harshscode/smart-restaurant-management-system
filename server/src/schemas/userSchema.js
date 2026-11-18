
import { z } from 'zod';

const name = z.string().trim().min(2).max(80);

const email = z.string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const phone = z.string()
  .trim()
  .max(25)
  .refine(
    value => value === '' || (
      /^[\d\s()+.-]+$/.test(value) &&
      value.replace(/\D/g, '').length >= 7
    ),
    'Enter a valid phone number.'
  );

const password = z.string()
  .min(12)
  .refine(
    value => Buffer.byteLength(value, 'utf8') <= 72,
    'Password is too long.'
  );

const role = z.enum(['customer', 'admin']);

// Only administrators can use this schema.
export const createUserSchema = z.object({
  name,
  email,
  phone: phone.optional().default(''),
  password,
  role: role.default('customer'),
}).strict();

// Customers can update only their own basic details.
export const updateProfileSchema = z.object({
  name: name.optional(),
  phone: phone.optional(),
}).strict().refine(
  values => Object.keys(values).length > 0,
  'Provide at least one field to update.'
);

// Administrators can manage account details and access.
export const updateUserSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  phone: phone.optional(),
  role: role.optional(),
  isActive: z.boolean().optional(),
}).strict().refine(
  values => Object.keys(values).length > 0,
  'Provide at least one field to update.'
);
