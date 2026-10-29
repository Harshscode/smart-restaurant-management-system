import { beforeEach, describe, expect, it } from 'vitest';
import { getMenu, placeOrder, findOrder, getOrders, reserveTable, getReservations, findTableForReservation, saveMenuItem, setOrderStatus } from '../services/restaurantService.js';
import { addDays } from '../lib/format.js';
import { TABLES } from '../data/seed.js';

beforeEach(() => { localStorage.clear(); });

const customer = { name: 'Jordan Smith', email: 'jordan@example.com', phone: '555-234-1234', address: '101 Sample Street' };

describe('browser data repository', () => {
  it('loads initial menu records', async () => {
    const menu = await getMenu();
    expect(menu.length).toBeGreaterThanOrEqual(18);
    expect(menu[0].category).toBe('Starters');
  });
  it('persists orders and finds them by reference plus email', async () => {
    const order = await placeOrder({ customer, fulfillment: 'pickup', items: [{ id: 'm05', quantity: 2 }] });
    expect(order.reference).toMatch(/^CT-/);
    expect(order.items[0].quantity).toBe(2);
    expect(await findOrder(order.reference, customer.email)).toMatchObject({ id: order.id });
    expect(await findOrder(order.reference, 'not-the-customer@example.com')).toBeNull();
    await setOrderStatus(order.id, 'Preparing');
    expect((await getOrders()).find(o => o.id === order.id).status).toBe('Preparing');
  });
  it('rejects orders containing unavailable items', async () => {
    const item = (await getMenu()).find(m => m.id === 'm05');
    await saveMenuItem({ ...item, available: false }, item.id);
    await expect(placeOrder({ customer, fulfillment: 'pickup', items: [{ id: item.id, quantity: 1 }] })).rejects.toThrow(/no longer available/i);
  });
  it('creates reservations and rejects booking clashes when all eligible tables are busy', async () => {
    const date = addDays(3), time = '19:00';
    const bookings = TABLES.map(t => ({ id: t.id, date, time, guests: t.capacity, status: 'Confirmed', tableId: t.id }));
    expect(findTableForReservation({ date, time, guests: 2 }, bookings)).toBeNull();
    const reservation = await reserveTable({ ...customer, date, time: '17:00', guests: 2, seating: 'Dining Room' });
    expect(reservation.status).toBe('Pending');
    expect((await getReservations()).some(r => r.id === reservation.id)).toBe(true);
  });
});
