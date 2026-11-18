
import { Router } from 'express';

import { createUserController } from '../controllers/userController.js';

import { requireAuth } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const handle = fn => (req, res, next) => {
  Promise.resolve()
    .then(() => fn(req, res))
    .catch(error => {
      if (error?.code === 11000) {
        return res.status(409).json({
          message: 'Email already in use.',
        });
      }

      next(error);
    });
};

export function createUserRouter(config) {
  const router = Router();

  const controller = createUserController(config);

  // All user endpoints require authentication
  router.use(requireAuth(config));

  // Customer and administrator profile endpoints
  router.get('/me', handle(controller.me));

  router.patch('/me', handle(controller.updateMe));

  router.delete('/me', handle(controller.deleteMe));

  // All remaining endpoints require admin privileges
  router.use(authorize('admin'));

  router.get('/', handle(controller.list));

  router.post('/', handle(controller.create));

  router.get('/:id', handle(controller.getOne));

  router.patch('/:id', handle(controller.update));

  router.delete('/:id', handle(controller.remove));

  return router;
}
