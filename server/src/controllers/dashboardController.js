
import { Order } from '../models/Order.js';
import { Reservation } from '../models/Reservation.js';
import { Event } from '../models/Event.js';
import { MenuItem } from '../models/MenuItem.js';
import { User } from '../models/User.js';

function dateInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const value = type =>
    parts.find(p => p.type === type)?.value;

  return `${value('year')}-${value('month')}-${value('day')}`;
}

function asMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export function createDashboardController(config) {
  return {
    async overview(_req, res) {
      const timeZone = config.restaurantTimeZone;
      const now = new Date();
      const weekStart = new Date(
        now.getTime() - 7 * 86400000
      );
      const today = dateInZone(now, timeZone);

      const [
        orderMetrics,
        reservationMetrics,
        eventMetrics,
        menuMetrics,
        registeredCustomers,
        dailyOrders,
        popularItems,
        recentOrders,
        upcomingReservations,
        recentEvents,
      ] = await Promise.all([
        Order.aggregate([
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              pendingOrders: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        '$status',
                        ['Placed', 'Preparing'],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              orderValue: {
                $sum: {
                  $cond: [
                    { $ne: ['$status', 'Cancelled'] },
                    '$total',
                    0,
                  ],
                },
              },
              completedRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'Delivered'] },
                    '$total',
                    0,
                  ],
                },
              },
            },
          },
        ]),

        Reservation.aggregate([
          {
            $group: {
              _id: null,
              totalReservations: { $sum: 1 },
              pendingReservations: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'Pending'] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),

        Event.aggregate([
          {
            $group: {
              _id: null,
              totalEvents: { $sum: 1 },
              pendingEvents: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'Pending'] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),

        MenuItem.aggregate([
          {
            $group: {
              _id: null,
              menuItems: { $sum: 1 },
              availableMenuItems: {
                $sum: {
                  $cond: [
                    { $eq: ['$available', true] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),

        User.countDocuments({
          role: 'customer',
          isActive: true,
        }),

        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: weekStart },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                  timezone: timeZone,
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        Order.aggregate([
          {
            $match: {
              status: { $ne: 'Cancelled' },
            },
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.menuItemId',
              name: { $first: '$items.name' },
              quantity: {
                $sum: '$items.quantity',
              },
            },
          },
          { $sort: { quantity: -1, name: 1 } },
          { $limit: 5 },
        ]),

        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select(
            'id reference customer.name total status createdAt'
          )
          .lean(),

        Reservation.find({
          date: { $gte: today },
          status: { $ne: 'Cancelled' },
        })
          .sort({ date: 1, time: 1 })
          .limit(5)
          .select(
            'id reference name date time guests seating status'
          )
          .lean(),

        Event.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select(
            'id reference name type date time guests status'
          )
          .lean(),
      ]);

      const ordersByDay = new Map(
        dailyOrders.map(row => [
          row._id,
          row.count,
        ])
      );

      const ordersLast7Days = Array.from(
        { length: 7 },
        (_, index) => {
          const date = dateInZone(
            new Date(
              now.getTime() -
              (6 - index) * 86400000
            ),
            timeZone
          );

          return {
            date,
            count: ordersByDay.get(date) || 0,
          };
        }
      );

      const orders = orderMetrics[0] || {};
      const reservations = reservationMetrics[0] || {};
      const events = eventMetrics[0] || {};
      const menu = menuMetrics[0] || {};

      return res.json({
        generatedAt: now.toISOString(),

        summary: {
          totalOrders: orders.totalOrders || 0,
          pendingOrders: orders.pendingOrders || 0,
          orderValue: asMoney(orders.orderValue),
          completedRevenue: asMoney(
            orders.completedRevenue
          ),

          totalReservations:
            reservations.totalReservations || 0,
          pendingReservations:
            reservations.pendingReservations || 0,

          totalEvents: events.totalEvents || 0,
          pendingEvents: events.pendingEvents || 0,

          menuItems: menu.menuItems || 0,
          availableMenuItems:
            menu.availableMenuItems || 0,

          registeredCustomers,
        },

        ordersLast7Days,

        popularItems: popularItems.map(item => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
        })),

        recentOrders: recentOrders.map(order => ({
          id: order.id,
          reference: order.reference,
          customerName: order.customer?.name || '',
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        })),

        upcomingReservations:
          upcomingReservations.map(booking => ({
            id: booking.id,
            reference: booking.reference,
            name: booking.name,
            date: booking.date,
            time: booking.time,
            guests: booking.guests,
            seating: booking.seating,
            status: booking.status,
          })),

        recentEvents: recentEvents.map(event => ({
          id: event.id,
          reference: event.reference,
          name: event.name,
          type: event.type,
          date: event.date,
          time: event.time,
          guests: event.guests,
          status: event.status,
        })),
      });
    },
  };
}
