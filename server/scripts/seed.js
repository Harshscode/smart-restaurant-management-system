
import mongoose from 'mongoose';

import { getConfig } from '../src/config/env.js';
import { connectDatabase } from '../src/config/db.js';

import { MenuItem } from '../src/models/MenuItem.js';
import { RestaurantTable } from '../src/models/RestaurantTable.js';

import { starterMenu } from '../../client/src/data/menu.js';

// Initial restaurant table configuration
const restaurantTables = [
  { id: 'T01', capacity: 2, seating: 'Dining Room' },
  { id: 'T02', capacity: 2, seating: 'Terrace' },
  { id: 'T03', capacity: 4, seating: 'Dining Room' },
  { id: 'T04', capacity: 4, seating: 'Dining Room' },
  { id: 'T05', capacity: 4, seating: 'Terrace' },
  { id: 'T06', capacity: 6, seating: 'Dining Room' },
  { id: 'T07', capacity: 6, seating: 'Terrace' },
  { id: 'T08', capacity: 8, seating: 'Dining Room' },
  { id: 'T09', capacity: 12, seating: 'Dining Room' },
];

function createInsertOperations(items) {
  return items.map(item => ({
    updateOne: {
      filter: { id: item.id },
      update: { $setOnInsert: item },
      upsert: true,
    },
  }));
}

async function seedDatabase() {
  const config = getConfig();

  await connectDatabase(config.mongoUri);

  console.log('Starting database seed...');

  // Add missing menu items without overwriting edits.
  const menuResult = await MenuItem.bulkWrite(
    createInsertOperations(starterMenu)
  );

  // Add missing restaurant tables.
  const tableResult = await RestaurantTable.bulkWrite(
    createInsertOperations(restaurantTables)
  );

  const menuCount = await MenuItem.countDocuments();
  const tableCount = await RestaurantTable.countDocuments();

  console.log('Database seed completed successfully.');
  console.log(`New menu items: ${menuResult.upsertedCount}`);
  console.log(`New tables: ${tableResult.upsertedCount}`);
  console.log(`Total menu items: ${menuCount}`);
  console.log(`Total tables: ${tableCount}`);
}

try {
  await seedDatabase();
} catch (error) {
  console.error('Database seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
