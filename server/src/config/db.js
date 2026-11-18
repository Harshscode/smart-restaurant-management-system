
import mongoose from 'mongoose';

import { User } from '../models/User.js';
import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
import { Reservation } from '../models/Reservation.js';
import { Event } from '../models/Event.js';
import { TableSchedule } from '../models/TableSchedule.js';
import { RestaurantTable } from '../models/RestaurantTable.js';

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is missing.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 7000,
    autoIndex: true,
  });

  await Promise.all([
    User,
    MenuItem,
    Order,
    Reservation,
    Event,
    TableSchedule,
    RestaurantTable,
  ].map(model => model.init()));

  console.log(
    `MongoDB connected: ${mongoose.connection.name}`
  );
}
