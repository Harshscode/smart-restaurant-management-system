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
  getOrders,
  reserveTable,
  requestEvent,
  saveMenuItem,
  setOrderStatus,
  updateReservation,
  cancelEvent,
  getDashboard,
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

describe('MongoDB API repository', () => {
  it('loads the live menu from Express', async () => {
    const menu = [
      {
        id: 'm01',
        name: 'Soup',
        available: true,
      },
    ];

    apiRequest.mockResolvedValue(menu);

    await expect(
      getMenu(),
    ).resolves.toEqual(menu);

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/menu',
    );
  });

  it(
    'places an order using server-compatible line items',
    async () => {
      const response = {
        id: 'order_1',
        reference: 'CT-ABC',
        status: 'Placed',
      };

      apiRequest.mockResolvedValue(response);

      const input = {
        customer: {
          name: 'Jordan Smith',
          email: 'JORDAN@example.com',
          phone: '555-234-1234',
          address: '',
        },
        fulfillment: 'pickup',
        notes: 'No cutlery',
        items: [
          {
            id: 'm05',
            quantity: 2,
            name: 'Ignored client value',
            price: 0.01,
          },
        ],
      };

      await expect(
        placeOrder(input),
      ).resolves.toEqual(response);

      expect(apiRequest).toHaveBeenCalledWith(
        '/api/orders',
        {
          method: 'POST',
          body: {
            customer: {
              ...input.customer,
              email: 'jordan@example.com',
            },
            fulfillment: 'pickup',
            notes: 'No cutlery',
            items: [
              {
                id: 'm05',
                quantity: 2,
              },
            ],
          },
        },
      );
    },
  );

  it(
    'unwraps paginated admin orders and supports tracking misses',
    async () => {
      apiRequest.mockResolvedValueOnce({
        orders: [
          {
            id: 'order_1',
          },
        ],
        pagination: {
          total: 1,
        },
      });

      await expect(
        getOrders(),
      ).resolves.toEqual([
        {
          id: 'order_1',
        },
      ]);

      const missing = Object.assign(
        new Error('Order not found.'),
        {
          status: 404,
        },
      );

      apiRequest.mockRejectedValueOnce(missing);

      await expect(
        findOrder(
          'CT-MISSING',
          'guest@example.com',
        ),
      ).resolves.toBeNull();
    },
  );

  it(
    'uses protected admin and customer mutation routes',
    async () => {
      apiRequest.mockResolvedValue({
        ok: true,
      });

      await saveMenuItem(
        {
          name: 'New dish',
          price: 18,
        },
        'm01',
      );

      await setOrderStatus(
        'order_1',
        'Preparing',
      );

      await updateReservation(
        'reservation_1',
        {
          date: '2026-12-01',
        },
      );

      await cancelEvent('event_1');

      expect(
        apiRequest,
      ).toHaveBeenNthCalledWith(
        1,
        '/api/menu/m01',
        expect.objectContaining({
          method: 'PATCH',
        }),
      );

      expect(
        apiRequest,
      ).toHaveBeenNthCalledWith(
        2,
        '/api/orders/order_1/status',
        {
          method: 'PATCH',
          body: {
            status: 'Preparing',
          },
        },
      );

      expect(
        apiRequest,
      ).toHaveBeenNthCalledWith(
        3,
        '/api/reservations/reservation_1',
        {
          method: 'PATCH',
          body: {
            date: '2026-12-01',
          },
        },
      );

      expect(
        apiRequest,
      ).toHaveBeenNthCalledWith(
        4,
        '/api/events/event_1/cancel',
        {
          method: 'PATCH',
        },
      );
    },
  );

  it(
    'creates reservation and event requests through Express',
    async () => {
      apiRequest
        .mockResolvedValueOnce({
          reference: 'RS-ABC',
          status: 'Pending',
        })
        .mockResolvedValueOnce({
          reference: 'EV-ABC',
          status: 'Pending',
        });

      const reservation = {
        name: 'Jordan',
        email: 'j@example.com',
        phone: '555-555-5555',
        date: '2026-12-10',
        time: '19:00',
        guests: 2,
        seating: 'Dining Room',
        notes: '',
      };

      const event = {
        ...reservation,
        type: 'Birthday Celebration',
        guests: 12,
        menuPreference: '',
      };

      const {
        seating: _seating,
        ...expectedEvent
      } = event;

      await expect(
        reserveTable(reservation),
      ).resolves.toMatchObject({
        reference: 'RS-ABC',
      });

      await expect(
        requestEvent(event),
      ).resolves.toMatchObject({
        reference: 'EV-ABC',
      });

      expect(
        apiRequest,
      ).toHaveBeenNthCalledWith(
        1,
        '/api/reservations',
        {
          method: 'POST',
          body: reservation,
        },
      );

      expect(
        apiRequest,
      ).toHaveBeenNthCalledWith(
        2,
        '/api/events',
        {
          method: 'POST',
          body: expectedEvent,
        },
      );
    },
  );

  it(
    'loads the authenticated dashboard endpoint',
    async () => {
      apiRequest.mockResolvedValue({
        summary: {
          totalOrders: 4,
        },
      });

      await expect(
        getDashboard(),
      ).resolves.toEqual({
        summary: {
          totalOrders: 4,
        },
      });

      expect(apiRequest).toHaveBeenCalledWith(
        '/api/admin/dashboard',
      );
    },
  );
});