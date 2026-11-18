
import { Router } from 'express';

import { createDashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

export function createDashboardRouter(config) {
  const router = Router();

  const controller = createDashboardController(config);

  // Only authenticated administrators can access
  // dashboard information.
  router.use(
    requireAuth(config),
    authorize('admin')
  );

  router.get('/dashboard', (req, res, next) => {
    Promise.resolve()
      .then(() => controller.overview(req, res))
      .catch(next);
  });

  return router;
}
