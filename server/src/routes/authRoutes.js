
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { createAuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

export function createAuthRouter(config) {
  const router = Router();
  const controller = createAuthController(config);

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
      message: 'Too many attempts. Try again later.',
    },
  });

  const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  router.post(
    '/register',
    registerLimiter,
    controller.register
  );

  router.post(
    '/login',
    loginLimiter,
    controller.login
  );

  router.post('/logout', controller.logout);

  router.get(
    '/me',
    requireAuth(config),
    controller.me
  );

  router.get(
    '/admin-check',
    requireAuth(config),
    authorize('admin'),
    controller.adminCheck
  );

  return router;
}