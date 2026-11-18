
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createApp(config) {
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
      return callback(error);
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '32kb' }));

  // Backend health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'copper-thyme-api',
    });
  });

  // Handle unknown API endpoints
  app.use('/api', (_req, res) => {
    res.status(404).json({
      message: 'API endpoint not found.',
    });
  });

  // Central error handler
  app.use((error, _req, res, _next) => {
    const status =
      error.status ||
      (error instanceof SyntaxError ? 400 : 500);

    res.status(status).json({
      message:
        status === 500
          ? 'Internal server error.'
          : error.message,
    });
  });

  return app;
}
