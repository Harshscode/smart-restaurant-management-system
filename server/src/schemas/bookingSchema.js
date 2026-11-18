
import { z } from 'zod';

const email = z.string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const phone = z.string()
  .trim()
  .min(7)
  .max(25)
  .refine(
    value =>
      /^[\d\s()+.-]+$/.test(value) &&
      value.replace(/\D/g, '').length >= 7,
    'Enter a valid phone number.'
  );

const date = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Use YYYY-MM-DD.'
);

const eventTime = z.string().regex(
  /^([01]\d|2[0-3]):[0-5]\d$/,
  'Use HH:mm.'
);

const reservationTime = z.string().regex(
  /^(1[2-9]|20):(?:00|30)$|^21:00$/,
  'Reservations start from 12:00 to 21:00, every 30 minutes.'
);

const contact = {
  name: z.string().trim().min(2).max(80),
  email,
  phone,
};

export const createReservationSchema = z.object({
  ...contact,
  date,
  time: reservationTime,
  guests: z.coerce.number().int().min(1).max(12),
  seating: z.enum([
    'Dining Room',
    'Terrace',
  ]).default('Dining Room'),
  notes: z.string().trim().max(500).default(''),
}).strict();

export const updateReservationSchema =
  createReservationSchema.pick({
    date: true,
    time: true,
    guests: true,
    seating: true,
    notes: true,
  }).partial().strict().refine(
    data => Object.keys(data).length > 0,
    'Provide at least one change.'
  );

export const createEventSchema = z.object({
  ...contact,
  type: z.enum([
    'Birthday Celebration',
    'Corporate Gathering',
    'Anniversary',
    'Family Celebration',
    'Other',
  ]),
  date,
  time: eventTime,
  guests: z.coerce.number().int().min(4).max(100),
  menuPreference: z.string()
    .trim()
    .max(200)
    .default(''),
  notes: z.string()
    .trim()
    .max(800)
    .default(''),
}).strict();

export const updateEventSchema = createEventSchema.pick({
  type: true,
  date: true,
  time: true,
  guests: true,
  menuPreference: true,
  notes: true,
}).partial().strict().refine(
  data => Object.keys(data).length > 0,
  'Provide at least one change.'
);

export const bookingLookupSchema = z.object({
  reference: z.string()
    .trim()
    .toUpperCase()
    .regex(/^(RS|EV)-[A-F0-9]{14}$/),
  email,
}).strict();

export const bookingStatusSchema = z.object({
  status: z.enum([
    'Confirmed',
    'Cancelled',
  ]),
}).strict();
