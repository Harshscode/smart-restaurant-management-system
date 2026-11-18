
import { createApp } from './app.js';
import { getConfig } from './config/env.js';

const config = getConfig();

const server = createApp(config).listen(
  config.port,
  () => {
    console.log(
      `Restaurant API running at http://localhost:${config.port}/api/health`
    );
  }
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
