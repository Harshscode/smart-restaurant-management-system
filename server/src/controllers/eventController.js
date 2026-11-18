
import { randomBytes, randomUUID } from 'node:crypto';

import { Event } from '../models/Event.js';

import {
  createEventSchema,
  updateEventSchema,
  bookingLookupSchema,
  bookingStatusSchema,
} from '../schemas/bookingSchema.js';

import {
  assertFutureBooking,
  bookingResponse,
  bookingFilter,
  invalidBooking,
} from '../services/bookingService.js';

function validId(req, res) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(req.params.id)) {
    res.status(400).json({
      message: 'Invalid event ID.',
    });
    return false;
  }

  return true;
}

async function cancelEvent(req, res) {
  if (!validId(req, res)) return;

  const event = await Event.findOneAndUpdate(
    {
      ...bookingFilter(req),
      status: { $in: ['Pending', 'Confirmed'] },
    },
    { $set: { status: 'Cancelled' } },
    { new: true }
  );

  if (!event) {
    const exists = await Event.exists(
      bookingFilter(req)
    );

    return res.status(exists ? 409 : 404).json({
      message: exists
        ? 'Event already cancelled.'
        : 'Event not found.',
    });
  }

  return res.json(bookingResponse(event));
}

export function createEventController(config) {
  return {
    async create(req, res) {
      const result = createEventSchema.safeParse(
        req.body
      );

      if (!result.success) {
        return invalidBooking(res, result);
      }

      const data = result.data;

      assertFutureBooking(
        data.date,
        data.time,
        config
      );

      if (req.user && req.user.email !== data.email) {
        return res.status(403).json({
          message: 'Use your account email for events.',
        });
      }

      const event = await Event.create({
        ...data,
        id: `event_${randomUUID()}`,
        reference:
          `EV-${randomBytes(7).toString('hex').toUpperCase()}`,
        userId: req.user?._id ?? null,
        status: 'Pending',
      });

      return res.status(201).json(
        bookingResponse(event)
      );
    },

    async lookup(req, res) {
      const result = bookingLookupSchema.safeParse(
        req.body
      );

      if (
        !result.success ||
        !result.data.reference.startsWith('EV-')
      ) {
        return res.status(400).json({
          message: 'Invalid event lookup.',
        });
      }

      const event = await Event.findOne({
        reference: result.data.reference,
        email: result.data.email,
      }).lean();

      if (!event) {
        return res.status(404).json({
          message: 'Event not found.',
        });
      }

      const {
        reference,
        type,
        date,
        time,
        guests,
        status,
      } = event;

      return res.json({
        reference,
        type,
        date,
        time,
        guests,
        status,
      });
    },

    async mine(req, res) {
      const events = await Event.find({
        userId: req.user._id,
      })
        .sort({ date: 1, time: 1 })
        .limit(200)
        .lean();

      return res.json(events.map(bookingResponse));
    },

    async list(req, res) {
      const events = await Event.find()
        .sort({ date: 1, time: 1 })
        .limit(200)
        .lean();

      return res.json(events.map(bookingResponse));
    },

    async getOne(req, res) {
      if (!validId(req, res)) return;

      const event = await Event.findOne(
        bookingFilter(req)
      ).lean();

      if (!event) {
        return res.status(404).json({
          message: 'Event not found.',
        });
      }

      return res.json(bookingResponse(event));
    },

    async update(req, res) {
      if (!validId(req, res)) return;

      const result = updateEventSchema.safeParse(
        req.body
      );

      if (!result.success) {
        return invalidBooking(res, result);
      }

      const existing = await Event.findOne(
        bookingFilter(req)
      );

      if (!existing) {
        return res.status(404).json({
          message: 'Event not found.',
        });
      }

      if (existing.status === 'Cancelled') {
        return res.status(409).json({
          message: 'Cancelled events cannot be edited.',
        });
      }

      const changes = result.data;

      const date = changes.date ?? existing.date;
      const time = changes.time ?? existing.time;

      const scheduleChanged = [
        'date',
        'time',
        'type',
        'guests',
      ].some(
        key =>
          changes[key] !== undefined &&
          changes[key] !== existing[key]
      );

      if (scheduleChanged) {
        assertFutureBooking(date, time, config);
      }

      const event = await Event.findOneAndUpdate(
        {
          ...bookingFilter(req),
          status: existing.status,
          updatedAt: existing.updatedAt,
        },
        {
          $set: {
            ...changes,
            ...(scheduleChanged
              ? { status: 'Pending' }
              : {}),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!event) {
        return res.status(409).json({
          message: 'Event changed. Refresh and retry.',
        });
      }

      return res.json(bookingResponse(event));
    },

    async cancel(req, res) {
      return cancelEvent(req, res);
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
        return cancelEvent(req, res);
      }

      const event = await Event.findOneAndUpdate(
        {
          id: req.params.id,
          status: 'Pending',
        },
        {
          $set: {
            status: 'Confirmed',
          },
        },
        { new: true }
      );

      if (!event) {
        const exists = await Event.exists({
          id: req.params.id,
        });

        return res.status(exists ? 409 : 404).json({
          message: exists
            ? 'Event cannot be confirmed.'
            : 'Event not found.',
        });
      }

      return res.json(bookingResponse(event));
    },
  };
}
