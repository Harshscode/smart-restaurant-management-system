import { addDays, calculateTotals } from '../lib/format.js';

export const TABLES = [
  { id: 'T01', capacity: 2 }, { id: 'T02', capacity: 2 }, { id: 'T03', capacity: 4 },
  { id: 'T04', capacity: 4 }, { id: 'T05', capacity: 4 }, { id: 'T06', capacity: 6 },
  { id: 'T07', capacity: 6 }, { id: 'T08', capacity: 8 }, { id: 'T09', capacity: 12 },
];

const demoCustomer = (name, email) => ({ name, email, phone: '555-012-3456', address: '' });

export function sampleOrders(menu) {
  const examples = [
    ['Amelia Parker', 'amelia@example.com', ['m05', 'm11'], 'Delivered', -4],
    ['Oliver Reed', 'oliver@example.com', ['m06', 'm04'], 'Delivered', -3],
    ['Noah Carter', 'noah@example.com', ['m08', 'm15'], 'Delivered', -2],
    ['Maya Singh', 'maya@example.com', ['m09', 'm13'], 'Preparing', 0],
    ['Ethan Brooks', 'ethan@example.com', ['m05', 'm17'], 'Placed', 0],
    ['Sofia Kim', 'sofia@example.com', ['m10', 'm12'], 'Ready', 0],
    ['Isabella Lee', 'isabella@example.com', ['m07', 'm11'], 'Delivered', -1],
  ];
  return examples.map(([name, email, ids, status, days], index) => {
    const items = ids.map((id) => {
      const match = menu.find(item => item.id === id);
      return { menuItemId: id, name: match.name, price: match.price, quantity: index % 3 === 0 ? 2 : 1 };
    });
    return {
      id: `demo-order-${index + 1}`, reference: `CT-DEMO00${index + 1}`,
      customer: demoCustomer(name, email), items, fulfillment: index % 2 ? 'delivery' : 'pickup',
      address: index % 2 ? 'Sample delivery address' : '', notes: '',
      ...calculateTotals(items, index % 2 ? 'delivery' : 'pickup'), status,
      createdAt: `${addDays(days)}T${String(12 + index).padStart(2, '0')}:10:00`,
    };
  });
}

export function sampleReservations() {
  return [
    { id: 'demo-r1', reference: 'RS-DEMO001', name: 'Grace Morgan', email: 'grace@example.com', phone: '555-012-0001', date: addDays(1), time: '19:00', guests: 2, seating: 'Dining Room', notes: 'Window seat if available', tableId: 'T01', status: 'Confirmed', createdAt: new Date().toISOString() },
    { id: 'demo-r2', reference: 'RS-DEMO002', name: 'Jacob Wilson', email: 'jacob@example.com', phone: '555-012-0002', date: addDays(2), time: '18:30', guests: 4, seating: 'Dining Room', notes: '', tableId: 'T03', status: 'Pending', createdAt: new Date().toISOString() },
    { id: 'demo-r3', reference: 'RS-DEMO003', name: 'Ava Thompson', email: 'ava@example.com', phone: '555-012-0003', date: addDays(3), time: '20:00', guests: 6, seating: 'Terrace', notes: 'Anniversary dinner', tableId: 'T06', status: 'Confirmed', createdAt: new Date().toISOString() },
    { id: 'demo-r4', reference: 'RS-DEMO004', name: 'Liam Patel', email: 'liam@example.com', phone: '555-012-0004', date: addDays(1), time: '13:00', guests: 3, seating: 'Dining Room', notes: '', tableId: 'T03', status: 'Pending', createdAt: new Date().toISOString() },
  ];
}

export function sampleEvents() {
  return [
    { id: 'demo-e1', reference: 'EV-DEMO001', name: 'Chloe Adams', email: 'chloe@example.com', phone: '555-012-0005', type: 'Birthday Celebration', date: addDays(10), time: '18:00', guests: 24, menuPreference: 'Shared dining menu', notes: 'Birthday cake arrangement', status: 'Pending', createdAt: new Date().toISOString() },
    { id: 'demo-e2', reference: 'EV-DEMO002', name: 'Lucas Brown', email: 'lucas@example.com', phone: '555-012-0006', type: 'Corporate Gathering', date: addDays(15), time: '19:00', guests: 36, menuPreference: 'Vegetarian options requested', notes: '', status: 'Confirmed', createdAt: new Date().toISOString() },
  ];
}
