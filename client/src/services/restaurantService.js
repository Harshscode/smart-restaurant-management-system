import { starterMenu } from '../data/menu.js';
import { TABLES, sampleOrders, sampleReservations, sampleEvents } from '../data/seed.js';
import { readStored, writeStored, deleteStored } from '../lib/storage.js';
import { calculateTotals, reference, uid } from '../lib/format.js';
import { validateCheckout, validateReservation, validateEvent, validateMenuItem, hasErrors } from '../lib/validation.js';

// Repository boundary: Phase 2 replaces these functions with fetch() calls to Express.
// The frontend uses these methods instead of reading localStorage directly.
const pause = (ms = 110) => new Promise(resolve => setTimeout(resolve, ms));
const clone = (value) => structuredClone(value);

function requireValid(errors) {
  if (hasErrors(errors)) {
    const error = new Error(Object.values(errors)[0]);
    error.fields = errors;
    throw error;
  }
}

function init() {
  if (readStored('initialized') === true) return;
  const menu = clone(starterMenu);
  writeStored('menu', menu);
  writeStored('orders', sampleOrders(menu));
  writeStored('reservations', sampleReservations());
  writeStored('events', sampleEvents());
  writeStored('initialized', true);
}

function store(name) {
  init();
  return readStored(name, []);
}

export async function getMenu() {
  await pause();
  return clone(store('menu'));
}

export async function saveMenuItem(input, id = null) {
  await pause();
  const item = {
    ...input, name: String(input.name || '').trim(), description: String(input.description || '').trim(),
    price: Number(input.price), ingredients: input.ingredients ?? [], allergens: input.allergens ?? [],
    dietary: input.dietary ?? [], available: Boolean(input.available), popular: Boolean(input.popular),
    featured: Boolean(input.featured), heat: Number(input.heat ?? 0), image: String(input.image || ''),
  };
  requireValid(validateMenuItem(item));
  const menu = store('menu');
  if (id) {
    const index = menu.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Menu item not found.');
    menu[index] = { ...menu[index], ...item, id };
  } else {
    menu.unshift({ ...item, id: uid('m') });
  }
  writeStored('menu', menu);
  return clone(menu);
}

export async function deleteMenuItem(id) {
  await pause();
  const menu = store('menu');
  if (!menu.some(item => item.id === id)) throw new Error('Menu item not found.');
  writeStored('menu', menu.filter(item => item.id !== id));
}

export async function getOrders() {
  await pause();
  return clone(store('orders')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function placeOrder(input) {
  await pause(220);
  requireValid(validateCheckout(input.customer || {}, input.fulfillment));
  if (!['pickup', 'delivery'].includes(input.fulfillment)) throw new Error('Choose delivery or pickup.');
  if (!Array.isArray(input.items) || !input.items.length) throw new Error('Your cart is empty.');
  const menu = store('menu');
  const items = input.items.map(line => {
    const item = menu.find(m => m.id === line.id);
    if (!item || !item.available) throw new Error('A selected item is no longer available. Please review your cart.');
    const quantity = Number(line.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Item quantity must be between 1 and 20.');
    return { menuItemId: item.id, name: item.name, price: item.price, quantity };
  });
  const totals = calculateTotals(items, input.fulfillment);
  const order = {
    id: uid('order'), reference: reference('CT'), items,
    customer: { ...input.customer, address: input.fulfillment === 'delivery' ? input.customer.address.trim() : '' },
    fulfillment: input.fulfillment, notes: String(input.notes || '').slice(0, 600),
    ...totals, status: 'Placed', createdAt: new Date().toISOString(),
  };
  writeStored('orders', [order, ...store('orders')]);
  return clone(order);
}

export async function findOrder(ref, email) {
  await pause();
  const result = store('orders').find(o => o.reference.toLowerCase() === String(ref || '').trim().toLowerCase() && o.customer.email.toLowerCase() === String(email || '').trim().toLowerCase());
  return result ? clone(result) : null;
}

export async function setOrderStatus(id, status) {
  await pause();
  if (!['Placed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].includes(status)) throw new Error('Invalid order status.');
  const orders = store('orders');
  const target = orders.find(o => o.id === id);
  if (!target) throw new Error('Order not found.');
  if (target.status === 'Cancelled' && status !== 'Cancelled') throw new Error('Cancelled orders cannot be reopened.');
  target.status = status;
  writeStored('orders', orders);
}

function timeValue(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function findTableForReservation(data, reservations) {
  const matching = reservations.filter(r => r.date === data.date && r.status !== 'Cancelled' && Math.abs(timeValue(r.time) - timeValue(data.time)) < 120);
  return TABLES.filter(t => t.capacity >= Number(data.guests)).sort((a, b) => a.capacity - b.capacity)
    .find(t => !matching.some(r => r.tableId === t.id)) || null;
}

export async function getReservations() {
  await pause();
  return clone(store('reservations')).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
}

export async function reserveTable(input) {
  await pause(180);
  requireValid(validateReservation(input));
  const existing = store('reservations');
  const assigned = findTableForReservation(input, existing);
  if (!assigned) throw new Error('No table is available for that party size and time. Please try another slot.');
  const reservation = {
    ...input, name: input.name.trim(), email: input.email.trim(),
    guests: Number(input.guests), seating: input.seating || 'Dining Room',
    id: uid('reservation'), reference: reference('RS'), tableId: assigned.id,
    status: 'Pending', createdAt: new Date().toISOString(),
  };
  writeStored('reservations', [reservation, ...existing]);
  return clone(reservation);
}

export async function setReservationStatus(id, status) {
  await pause();
  if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) throw new Error('Invalid reservation status.');
  const reservations = store('reservations');
  const target = reservations.find(r => r.id === id);
  if (!target) throw new Error('Reservation not found.');
  if (target.status === 'Cancelled' && status !== 'Cancelled') {
    const available = findTableForReservation(target, reservations.filter(r => r.id !== id));
    if (!available) throw new Error('No table is available to reopen this booking.');
    target.tableId = available.id;
  }
  target.status = status;
  writeStored('reservations', reservations);
}

export async function getEvents() {
  await pause();
  return clone(store('events')).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
}

export async function requestEvent(input) {
  await pause(170);
  requireValid(validateEvent(input));
  const event = {
    ...input, name: input.name.trim(), email: input.email.trim(), guests: Number(input.guests),
    id: uid('event'), reference: reference('EV'), status: 'Pending', createdAt: new Date().toISOString(),
  };
  writeStored('events', [event, ...store('events')]);
  return clone(event);
}

export async function setEventStatus(id, status) {
  await pause();
  if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) throw new Error('Invalid event status.');
  const events = store('events');
  const target = events.find(e => e.id === id);
  if (!target) throw new Error('Event not found.');
  target.status = status;
  writeStored('events', events);
}

export async function getDashboard() {
  const [menu, orders, reservations, events] = await Promise.all([getMenu(), getOrders(), getReservations(), getEvents()]);
  return {
    menu, orders, reservations, events,
    totalRevenue: orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => ['Placed', 'Preparing'].includes(o.status)).length,
    pendingReservations: reservations.filter(r => r.status === 'Pending').length,
    pendingEvents: events.filter(e => e.status === 'Pending').length,
  };
}

export async function resetDemoData() {
  ['initialized', 'menu', 'orders', 'reservations', 'events', 'cart'].forEach(deleteStored);
  init();
}
