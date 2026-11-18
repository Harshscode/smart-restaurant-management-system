
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Starters', 'Mains', 'Desserts', 'Beverages'],
  },
  description: {
    type: String,
    required: true,
  },
  ingredients: {
    type: [String],
    default: [],
  },
  allergens: {
    type: [String],
    default: [],
  },
  dietary: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
  },
  available: {
    type: Boolean,
    default: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  heat: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  image: {
    type: String,
    default: '',
  },
}, { timestamps: true });

menuItemSchema.index({
  category: 1,
  available: 1,
});

export const MenuItem = mongoose.model(
  'MenuItem',
  menuItemSchema
);
