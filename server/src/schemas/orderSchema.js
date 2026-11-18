
import { z } from 'zod';

const email = z.string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const phone = z.string()
  .trim()
  .min(7)
  .max(20)
  .refine(
    value =>
      /^[\d\s()+.-]+$/.test(value) &&
      value.replace(/\D/g, '').length >= 7,
    'Enter a valid phone number.'
  );

const lines = z.array(
  z.object({
    id: z.string().trim().min(1).max(80),
    quantity: z.number().int().min(1).max(20),
  }).strict()
)
  .min(1)
  .max(40)
  .refine(
    items =>
      new Set(items.map(item => item.id)).size === items.length,
    'Each menu item must appear only once.'
  );

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email,
    phone,
    address: z.string().trim().max(240).default(''),
  }),

  fulfillment: z.enum(['pickup', 'delivery']),

  items: lines,

  notes: z.string().trim().max(600).default(''),
}).strict().superRefine((order, ctx) => {
  if (
    order.fulfillment === 'delivery' &&
    order.customer.address.length < 5
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customer', 'address'],
      message: 'Delivery address is required.',
    });
  }
});

export const updateOrderItemsSchema = z.object({
  items: lines,
}).strict();

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'Preparing',
    'Ready',
    'Delivered',
    'Cancelled',
  ]),
}).strict();

export const trackOrderSchema = z.object({
  reference: z.string()
    .trim()
    .toUpperCase()
    .regex(
      /^CT-[A-Z0-9]{8,32}$/,
      'Invalid order reference.'
    ),
  email,
}).strict();
