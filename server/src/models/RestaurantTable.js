
import mongoose from 'mongoose';

const restaurantTableSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
  seating: {
    type: String,
    enum: ['Dining Room', 'Terrace'],
    default: 'Dining Room',
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const RestaurantTable = mongoose.model(
  'RestaurantTable',
  restaurantTableSchema
);
