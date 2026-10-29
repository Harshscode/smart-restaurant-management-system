import { describe, expect, it } from 'vitest';
import { validateCheckout, validateMenuItem, validateReservation, validateEvent } from '../lib/validation.js';
import { addDays } from '../lib/format.js';

const contact = { name: 'Alex Morgan', email: 'alex@example.com', phone: '(555) 234-1234' };

describe('form validation', () => {
  it('validates customer contact data', () => {
    expect(validateCheckout({ ...contact, address: '101 Main Street' }, 'delivery')).toEqual({});
    expect(validateCheckout({ ...contact, address: '' }, 'delivery').address).toBeTruthy();
    expect(validateCheckout({ ...contact, email: 'invalid' }, 'pickup').email).toBeTruthy();
  });
  it('rejects invalid reservations and accepts valid ones', () => {
    const future = { ...contact, date: addDays(3), time: '19:00', guests: 2 };
    expect(validateReservation(future)).toEqual({});
    expect(validateReservation({ ...future, date: addDays(-1) }).date).toBeTruthy();
    expect(validateReservation({ ...future, guests: 13 }).guests).toBeTruthy();
    expect(validateReservation({ ...future, time: '23:00' }).time).toBeTruthy();
  });
  it('requires sensible event group sizes', () => {
    const event = { ...contact, type: 'Birthday Celebration', date: addDays(5), time: '18:00', guests: 20 };
    expect(validateEvent(event)).toEqual({});
    expect(validateEvent({ ...event, guests: 2 }).guests).toBeTruthy();
  });
  it('rejects negative prices and missing menu ingredients', () => {
    const item = { name: 'Roasted pumpkin', category: 'Starters', description: 'Pumpkin with fresh herbs', price: 12, ingredients: ['Pumpkin'] };
    expect(validateMenuItem(item)).toEqual({});
    expect(validateMenuItem({ ...item, price: -2 }).price).toBeTruthy();
    expect(validateMenuItem({ ...item, ingredients: [] }).ingredients).toBeTruthy();
  });
});
