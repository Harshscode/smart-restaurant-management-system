
import mongoose from 'mongoose';

const tableScheduleSchema = new mongoose.Schema({
  tableId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  slots: {
    type: [Number],
    default: undefined,
  },
});

tableScheduleSchema.index(
  { tableId: 1, date: 1 },
  { unique: true }
);

export const TableSchedule = mongoose.model(
  'TableSchedule',
  tableScheduleSchema
);
