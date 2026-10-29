export const money = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 2,
}).format(Number(amount) || 0);

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(days, origin = new Date()) {
  const d = new Date(origin);
  d.setDate(d.getDate() + days);
  return localDateString(d);
}

export const prettyDate = (date) => {
  if (!date) return '—';
  const parsed = String(date).length === 10 ? new Date(`${date}T12:00:00`) : new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const prettyTime = (time) => {
  if (!time) return '—';
  const [hh, mm] = time.split(':').map(Number);
  const hour = hh % 12 || 12;
  return `${hour}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
};

export const uid = (prefix = 'id') => `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;

export const reference = (prefix) => `${prefix}-${Date.now().toString(36).slice(-6).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Beverages'];
export const DIETS = ['Vegetarian', 'Vegan', 'Gluten-Free'];
export const ORDER_STATUSES = ['Placed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled'];

export function calculateTotals(lines, deliveryType = 'pickup') {
  const subtotal = Math.round(lines.reduce((sum, line) => sum + Number(line.price) * Number(line.quantity), 0) * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const deliveryFee = deliveryType === 'delivery' && subtotal > 0 ? 3.99 : 0;
  return { subtotal, tax, deliveryFee, total: Math.round((subtotal + tax + deliveryFee) * 100) / 100 };
}

export const emailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
export const phoneValid = (value) => /^[\d\s()+.-]{7,20}$/.test(String(value || '').trim()) && String(value).replace(/\D/g, '').length >= 7;
