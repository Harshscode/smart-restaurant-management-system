
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { orderController } from '../controllers/orderController.js';

import { optionalAuth } from '../middleware/optionalAuth.js';

import { requireAuth } from '../middleware/authenticate.js';

import { authorize } from '../middleware/authorize.js';

const handle = fn => (req, res, next) => {
  Promise.resolve(
    fn(req, res)
  ).catch(next);
};

export function createOrderRouter(config) {
  const router = Router();

  const trackingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  // Guest or logged-in customer: Place an order
  router.post(
    '/',
    checkoutLimiter,
    optionalAuth(config),
    handle(orderController.create)
  );

  // Guest order tracking
  router.post(
    '/track',
    trackingLimiter,
    handle(orderController.track)
  );

  // Routes below require a valid login
  router.use(requireAuth(config));

  // Customer order history
  router.get(
    '/mine',
    handle(orderController.mine)
  );

  // Admin: All orders
  router.get(
    '/',
    authorize('admin'),
    handle(orderController.list)
  );

  // Owner or admin: View one order
  router.get(
    '/:id',
    handle(orderController.getOne)
  );

  // Owner: Edit order items
  router.patch(
    '/:id/items',
    handle(orderController.updateItems)
  );

  // Owner: Cancel an unprepared order
  router.patch(
    '/:id/cancel',
    handle(orderController.cancel)
  );

  // Admin: Update order status
  router.patch(
    '/:id/status',
    authorize('admin'),
    handle(orderController.updateStatus)
  );

  return router;
}
