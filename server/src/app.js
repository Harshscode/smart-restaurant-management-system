
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { createAuthRouter } from './routes/authRoutes.js';
import { createMenuRouter } from './routes/menuRoutes.js';
import { protectWrites } from './middleware/protectWrites.js';

export function createApp(config) {
  if (
    !config.jwtSecret ||
    config.jwtSecret.includes('REPLACE_WITH') ||
    Buffer.byteLength(config.jwtSecret, 'utf8') < 32
  ) {
    throw new Error(
      'Configure a secure JWT_SECRET in server/.env.'
    );
  }

  const app = express();

  app.disable('x-powered-by');

  app.use(helmet());

  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.origins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origin not allowed.');
      error.status = 403;
      callback(error);
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());

  // Protect state-changing API requests.
  app.use('/api', protectWrites(config));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'copper-thyme-api',
    });
  });

  // Authentication endpoints
  app.use('/api/auth', createAuthRouter(config));

  // MongoDB-backed restaurant menu API
  app.use('/api/menu', createMenuRouter(config));

  // Unknown API endpoints
  app.use('/api', (_req, res) => {
    res.status(404).json({
      message: 'API endpoint not found.',
    });
  });

  // Central error handler
  app.use((error, _req, res, _next) => {
    const status =
      error.status ||
      (error.type === 'entity.parse.failed' ? 400 : 500);

    res.status(status).json({
      message: status === 500
        ? 'Internal server error.'
        : error.message,
    });
  });

  return app;
}
