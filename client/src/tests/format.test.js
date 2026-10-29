import { describe, expect, it } from 'vitest';
import { calculateTotals, money, addDays } from '../lib/format.js';

describe('order total calculations', () => {
  const items = [{ price: 12.5, quantity: 2 }, { price: 7, quantity: 1 }];
  it('calculates pickup totals without delivery charges', () => {
    expect(calculateTotals(items, 'pickup')).toEqual({ subtotal: 32, tax: 2.56, deliveryFee: 0, total: 34.56 });
  });
  it('adds a delivery charge for delivery orders', () => {
    expect(calculateTotals(items, 'delivery')).toEqual({ subtotal: 32, tax: 2.56, deliveryFee: 3.99, total: 38.55 });
  });
  it('does not charge delivery for an empty cart', () => {
    expect(calculateTotals([], 'delivery').total).toBe(0);
  });
  it('formats prices and relative dates', () => {
    expect(money(24)).toBe('$24.00');
    expect(addDays(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
