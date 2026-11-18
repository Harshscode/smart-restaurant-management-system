
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { createEventController } from '../controllers/eventController.js';

import { optionalAuth } from '../middleware/optionalAuth.js';
import { requireAuth } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const handle = fn => (req, res, next) =>
  Promise.resolve()
    .then(() => fn(req, res))
    .catch(next);

export function createEventRouter(config) {
  const router = Router();

  const controller = createEventController(config);

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  // Public event enquiries
  router.post(
    '/',
    limiter,
    optionalAuth(config),
    handle(controller.create)
  );

  router.post(
    '/lookup',
    limiter,
    handle(controller.lookup)
  );

  // Authenticated routes
  router.use(requireAuth(config));

  router.get(
    '/mine',
    handle(controller.mine)
  );

  router.get(
    '/',
    authorize('admin'),
    handle(controller.list)
  );

  router.get(
    '/:id',
    handle(controller.getOne)
  );

  router.patch(
    '/:id',
    handle(controller.update)
  );

  router.patch(
    '/:id/cancel',
    handle(controller.cancel)
  );

  router.patch(
    '/:id/status',
    authorize('admin'),
    handle(controller.updateStatus)
  );

  return router;
}
