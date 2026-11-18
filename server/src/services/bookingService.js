
import { RestaurantTable } from '../models/RestaurantTable.js';
import { TableSchedule } from '../models/TableSchedule.js';

export function bookingError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function assertFutureBooking(date, time, config) {
  const parsed = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw bookingError(
      400,
      'Choose a valid calendar date.'
    );
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: config.restaurantTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const part = key =>
    parts.find(item => item.type === key)?.value;

  const today =
    `${part('year')}-${part('month')}-${part('day')}`;

  const nowMinutes =
    Number(part('hour')) * 60 +
    Number(part('minute'));

  const [hour, minute] = time.split(':').map(Number);

  const requested =
    Date.parse(`${date}T00:00:00Z`) +
    (hour * 60 + minute) * 60000;

  const current =
    Date.parse(`${today}T00:00:00Z`) +
    nowMinutes * 60000;

  if (requested - current < 30 * 60000) {
    throw bookingError(
      400,
      'Choose a time at least 30 minutes in the future.'
    );
  }
}

function bookingSlots(time) {
  const [hour, minute] = time.split(':').map(Number);
  const start = hour * 60 + minute;

  return [
    start,
    start + 30,
    start + 60,
    start + 90,
  ];
}

export async function claimTable({
  date,
  time,
  guests,
  seating,
}) {
  const tables = await RestaurantTable.find({
    active: true,
    capacity: { $gte: guests },
  }).lean();

  // Prefer requested seating, then smallest suitable table.
  tables.sort(
    (a, b) =>
      Number(a.seating !== seating) -
        Number(b.seating !== seating) ||
      a.capacity - b.capacity ||
      a.id.localeCompare(b.id)
  );

  const slots = bookingSlots(time);

  for (const table of tables) {
    try {
      await TableSchedule.updateOne(
        {
          tableId: table.id,
          date,
        },
        {
          $setOnInsert: {
            tableId: table.id,
            date,
            slots: [],
          },
        },
        { upsert: true }
      );
    } catch (error) {
      // Another request may have created this schedule.
      if (error.code !== 11000) throw error;
    }

    const claimed = await TableSchedule.findOneAndUpdate(
      {
        tableId: table.id,
        date,
        slots: { $nin: slots },
      },
      {
        $addToSet: {
          slots: { $each: slots },
        },
      },
      { new: true }
    );

    if (claimed) {
      return {
        tableId: table.id,
        seating: table.seating,
        date,
        time,
      };
    }
  }

  throw bookingError(
    409,
    'No table is available for that time and party size.'
  );
}

export async function releaseTable({
  tableId,
  date,
  time,
}) {
  await TableSchedule.updateOne(
    { tableId, date },
    {
      $pullAll: {
        slots: bookingSlots(time),
      },
    }
  );
}

export function bookingResponse(document) {
  const value = document.toObject
    ? document.toObject()
    : document;

  const { _id, __v, ...data } = value;

  return {
    ...data,
    userId: data.userId
      ? String(data.userId)
      : null,
  };
}

export function bookingFilter(req) {
  const filter = {
    id: req.params.id,
  };

  if (req.user.role !== 'admin') {
    filter.userId = req.user._id;
  }

  return filter;
}

export function invalidBooking(res, result) {
  return res.status(400).json({
    message: 'Invalid booking information.',
    errors: result.error.flatten(),
  });
}
