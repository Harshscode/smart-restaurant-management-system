
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { getConfig } from '../src/config/env.js';
import { connectDatabase } from '../src/config/db.js';
import { User } from '../src/models/User.js';

async function seedAdmin() {
  const config = getConfig();

  const email = String(
    process.env.SEED_ADMIN_EMAIL || ''
  ).trim().toLowerCase();

  const password = process.env.SEED_ADMIN_PASSWORD || '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set a valid SEED_ADMIN_EMAIL.');
  }

  if (
    password.includes('REPLACE_WITH') ||
    password.length < 12 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new Error(
      'Set a strong SEED_ADMIN_PASSWORD in server/.env.'
    );
  }

  await connectDatabase(config.mongoUri);

  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== 'admin') {
      throw new Error(
        'This email belongs to a non-admin account.'
      );
    }

    console.log('Administrator already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name: 'Restaurant Administrator',
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
  });

  console.log('Administrator account created.');
}

try {
  await seedAdmin();
} catch (error) {
  console.error('Admin seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
