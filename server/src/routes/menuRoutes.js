
import { Router } from 'express';

import { menuController } from '../controllers/menuController.js';
import { requireAuth } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const asyncHandler = handler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export function createMenuRouter(config) {
  const router = Router();

  // Public menu endpoints
  router.get(
    '/',
    asyncHandler(menuController.list)
  );

  router.get(
    '/:id',
    asyncHandler(menuController.getOne)
  );

  // All following endpoints require admin access
  router.use(
    requireAuth(config),
    authorize('admin')
  );

  router.post(
    '/',
    asyncHandler(menuController.create)
  );

  router.patch(
    '/:id',
    asyncHandler(menuController.update)
  );

  router.delete(
    '/:id',
    asyncHandler(menuController.remove)
  );

  return router;
}
