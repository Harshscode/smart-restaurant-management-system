import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { apiRequest } from '../services/apiClient.js';
import {
  getMenu,
  placeOrder,
  findOrder,
  reserveTable,
  getReservations,
} from '../services/restaurantService.js';

vi.mock(
  '../services/apiClient.js',
  () => ({
    apiRequest: vi.fn(),
  }),
);

beforeEach(() => {
  apiRequest.mockReset();
});

describe(
  'frontend-to-API workflow contracts',
  () => {
    it(
      'supports the menu, checkout, and tracking sequence',
      async () => {
        const menu = [
          {
            id: 'm01',
            name: 'Seasonal Bowl',
            price: 18,
            available: true,
          },
        ];

        const order = {
          id: 'order_1',
          reference: 'CT-123',
          customer: {
            email: 'demo@example.com',
          },
          items: [
            {
              menuItemId: 'm01',
              name: 'Seasonal Bowl',
              price: 18,
              quantity: 1,
            },
          ],
          total: 19.44,
          status: 'Placed',
        };

        apiRequest
          .mockResolvedValueOnce(menu)
          .mockResolvedValueOnce(order)
          .mockResolvedValueOnce(order);

        await expect(
          getMenu(),
        ).resolves.toEqual(menu);

        await expect(
          placeOrder({
            customer: {
              name: 'Demo Customer',
              email: 'demo@example.com',
              phone: '555-123-4567',
              address: '',
            },
            fulfillment: 'pickup',
            notes: '',
            items: [
              {
                id: 'm01',
                quantity: 1,
              },
            ],
          }),
        ).resolves.toEqual(order);

        await expect(
          findOrder(
            order.reference,
            order.customer.email,
          ),
        ).resolves.toEqual(order);

        expect(
          apiRequest.mock.calls.map(
            call => call[0],
          ),
        ).toEqual([
          '/api/menu',
          '/api/orders',
          '/api/orders/track',
        ]);
      },
    );

    it(
      'creates a reservation and reads the authenticated history',
      async () => {
        const reservation = {
          id: 'reservation_1',
          reference: 'RS-123',
          status: 'Pending',
        };

        apiRequest
          .mockResolvedValueOnce(reservation)
          .mockResolvedValueOnce([
            reservation,
          ]);

        await expect(
          reserveTable({
            name: 'Demo Customer',
            email: 'demo@example.com',
            phone: '555-123-4567',
            date: '2026-12-03',
            time: '17:00',
            guests: 2,
            seating: 'Dining Room',
            notes: '',
          }),
        ).resolves.toEqual(reservation);

        await expect(
          getReservations(),
        ).resolves.toEqual([
          reservation,
        ]);

        expect(
          apiRequest.mock.calls.map(
            call => call[0],
          ),
        ).toEqual([
          '/api/reservations',
          '/api/reservations',
        ]);
      },
    );
  },
);