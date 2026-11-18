
import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  seating: {
    type: String,
    default: 'Dining Room',
  },
  notes: {
    type: String,
    default: '',
  },
  tableId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true });

reservationSchema.index({
  date: 1,
  status: 1,
});

export const Reservation = mongoose.model(
  'Reservation',
  reservationSchema
);
