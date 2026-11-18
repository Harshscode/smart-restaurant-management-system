
import { randomBytes, randomUUID } from 'node:crypto';

import { Reservation } from '../models/Reservation.js';
import { RestaurantTable } from '../models/RestaurantTable.js';

import {
  createReservationSchema,
  updateReservationSchema,
  bookingLookupSchema,
  bookingStatusSchema,
} from '../schemas/bookingSchema.js';

import {
  assertFutureBooking,
  claimTable,
  releaseTable,
  bookingResponse,
  bookingFilter,
  bookingError,
  invalidBooking,
} from '../services/bookingService.js';

function validId(req, res) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(req.params.id)) {
    res.status(400).json({
      message: 'Invalid reservation ID.',
    });
    return false;
  }

  return true;
}

async function cancelReservation(req, res) {
  if (!validId(req, res)) return;

  const filter = bookingFilter(req);

  const previous = await Reservation.findOneAndUpdate(
    {
      ...filter,
      status: { $in: ['Pending', 'Confirmed'] },
    },
    { $set: { status: 'Cancelled' } },
    { new: false }
  );

  if (!previous) {
    const exists = await Reservation.exists(filter);

    return res.status(exists ? 409 : 404).json({
      message: exists
        ? 'Reservation is already cancelled.'
        : 'Reservation not found.',
    });
  }

  await releaseTable(previous);

  return res.json({
    ...bookingResponse(previous),
    status: 'Cancelled',
  });
}

export function createReservationController(config) {
  return {
    async create(req, res) {
      const result = createReservationSchema.safeParse(
        req.body
      );

      if (!result.success) {
        return invalidBooking(res, result);
      }

      const input = result.data;

      assertFutureBooking(input.date, input.time, config);

      if (req.user && input.email !== req.user.email) {
        return res.status(403).json({
          message: 'Use your account email for bookings.',
        });
      }

      const claim = await claimTable(input);

      try {
        const reservation = await Reservation.create({
          ...input,
          seating: claim.seating,
          tableId: claim.tableId,
          id: `reservation_${randomUUID()}`,
          reference:
            `RS-${randomBytes(7).toString('hex').toUpperCase()}`,
          userId: req.user?._id ?? null,
          status: 'Pending',
        });

        return res.status(201).json(
          bookingResponse(reservation)
        );
      } catch (error) {
        await releaseTable(claim);
        throw error;
      }
    },

    async lookup(req, res) {
      const result = bookingLookupSchema.safeParse(
        req.body
      );

      if (
        !result.success ||
        !result.data.reference.startsWith('RS-')
      ) {
        return res.status(400).json({
          message: 'Invalid booking lookup.',
        });
      }

      const booking = await Reservation.findOne({
        reference: result.data.reference,
        email: result.data.email,
      }).lean();

      if (!booking) {
        return res.status(404).json({
          message: 'Reservation not found.',
        });
      }

      const {
        reference,
        date,
        time,
        guests,
        seating,
        status,
      } = booking;

      return res.json({
        reference,
        date,
        time,
        guests,
        seating,
        status,
      });
    },

    async mine(req, res) {
      const reservations = await Reservation.find({
        userId: req.user._id,
      })
        .sort({ date: 1, time: 1 })
        .limit(200)
        .lean();

      return res.json(
        reservations.map(bookingResponse)
      );
    },

    async list(req, res) {
      const reservations = await Reservation.find()
        .sort({ date: 1, time: 1 })
        .limit(200)
        .lean();

      return res.json(
        reservations.map(bookingResponse)
      );
    },

    async getOne(req, res) {
      if (!validId(req, res)) return;

      const booking = await Reservation.findOne(
        bookingFilter(req)
      ).lean();

      if (!booking) {
        return res.status(404).json({
          message: 'Reservation not found.',
        });
      }

      return res.json(bookingResponse(booking));
    },

    async update(req, res) {
      if (!validId(req, res)) return;

      const result = updateReservationSchema.safeParse(
        req.body
      );

      if (!result.success) {
        return invalidBooking(res, result);
      }

      const previous = await Reservation.findOne(
        bookingFilter(req)
      );

      if (!previous) {
        return res.status(404).json({
          message: 'Reservation not found.',
        });
      }

      if (previous.status === 'Cancelled') {
        return res.status(409).json({
          message: 'Cancelled reservations cannot be edited.',
        });
      }

      const changes = result.data;

      const nextData = {
        date: changes.date ?? previous.date,
        time: changes.time ?? previous.time,
        guests: changes.guests ?? previous.guests,
        seating: changes.seating ?? previous.seating,
      };

      const changesTable = [
        'date',
        'time',
        'guests',
        'seating',
      ].some(
        key => nextData[key] !== previous[key]
      );

      let claim = null;

      if (changesTable) {
        assertFutureBooking(
          nextData.date,
          nextData.time,
          config
        );

        const currentTable = await RestaurantTable.findOne({
          id: previous.tableId,
          active: true,
          seating: nextData.seating,
          capacity: { $gte: nextData.guests },
        }).lean();

        const keepTable =
          nextData.date === previous.date &&
          nextData.time === previous.time &&
          currentTable;

        if (!keepTable) {
          claim = await claimTable(nextData);
        }
      }

      const updates = { ...changes };

      if (changesTable) {
        updates.status = 'Pending';
      }

      if (claim) {
        updates.tableId = claim.tableId;
        updates.seating = claim.seating;
      }

      let updated;

      try {
        updated = await Reservation.findOneAndUpdate(
          {
            ...bookingFilter(req),
            status: previous.status,
            date: previous.date,
            time: previous.time,
            tableId: previous.tableId,
            updatedAt: previous.updatedAt,
          },
          { $set: updates },
          {
            new: true,
            runValidators: true,
          }
        );
      } catch (error) {
        if (claim) await releaseTable(claim);
        throw error;
      }

      if (!updated) {
        if (claim) await releaseTable(claim);

        throw bookingError(
          409,
          'Reservation changed. Please refresh and retry.'
        );
      }

      if (claim) {
        await releaseTable(previous);
      }

      return res.json(bookingResponse(updated));
    },

    async cancel(req, res) {
      return cancelReservation(req, res);
    },

    async updateStatus(req, res) {
      if (!validId(req, res)) return;

      const result = bookingStatusSchema.safeParse(
        req.body
      );

      if (!result.success) {
        return invalidBooking(res, result);
      }

      if (result.data.status === 'Cancelled') {
        return cancelReservation(req, res);
      }

      const updated = await Reservation.findOneAndUpdate(
        {
          id: req.params.id,
          status: 'Pending',
        },
        {
          $set: {
            status: 'Confirmed',
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updated) {
        const exists = await Reservation.exists({
          id: req.params.id,
        });

        return res.status(exists ? 409 : 404).json({
          message: exists
            ? 'Reservation cannot be confirmed.'
            : 'Reservation not found.',
        });
      }

      return res.json(bookingResponse(updated));
    },
  };
}