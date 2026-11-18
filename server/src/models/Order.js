
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
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
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
  },
  items: {
    type: [orderItemSchema],
    default: [],
  },
  fulfillment: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  subtotal: Number,
  tax: Number,
  deliveryFee: Number,
  total: Number,
  status: {
    type: String,
    enum: [
      'Placed',
      'Preparing',
      'Ready',
      'Delivered',
      'Cancelled',
    ],
    default: 'Placed',
  },
}, { timestamps: true });

orderSchema.index({
  'customer.email': 1,
  reference: 1,
});

export const Order = mongoose.model('Order', orderSchema);
