import { describe, it, expect } from 'vitest';
import { starterMenu } from '../data/menu.js';
import { getMenu, placeOrder, getOrders, reserveTable, getReservations } from '../services/restaurantService.js';
import { addDays } from '../lib/format.js';

describe('remaining frontend browser demo flows', () => {
  it('has searchable starter menu data', () => {
    expect(starterMenu.length).toBeGreaterThanOrEqual(18);
    expect(starterMenu.some(item => item.dietary.includes('Vegetarian'))).toBe(true);
  });
  it('can place a pickup order using browser-local services', async () => {
    localStorage.clear();
    const items = await getMenu();
    const available = items.find(item => item.available);
    const customer = { name:'Demo Customer', email:'demo@example.com', phone:'555-123-4567', address:'' };
    const order = await placeOrder({ customer, fulfillment:'pickup', items:[{ id:available.id, quantity:1 }] });
    expect(order.reference).toMatch(/^CT-/);
    expect((await getOrders()).some(item => item.reference === order.reference)).toBe(true);
  });
  it('can create and retrieve a demo reservation', async () => {
    localStorage.clear();
    const result = await reserveTable({ name:'Demo Customer', email:'demo@example.com', phone:'555-123-4567', date:addDays(3), time:'17:00', guests:2, seating:'Dining Room' });
    expect(result.reference).toMatch(/^RS-/);
    expect((await getReservations()).some(item => item.id === result.id)).toBe(true);
  });
});
