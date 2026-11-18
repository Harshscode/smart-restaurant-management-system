
import mongoose from 'mongoose';

import { getConfig } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createApp } from './app.js';

const config = getConfig();

try {
  await connectDatabase(config.mongoUri);

  const server = createApp(config).listen(
    config.port,
    () => {
      console.log(
        `Restaurant API running at http://localhost:${config.port}/api/health`
      );
    }
  );

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });
  }

} catch (error) {
  console.error('Backend startup failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
}
