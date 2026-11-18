
import { User } from '../models/User.js';

import {
  AUTH_COOKIE,
  verifyAuthToken,
} from '../lib/auth.js';

export function requireAuth(config) {
  return async (req, res, next) => {
    const token = req.cookies?.[AUTH_COOKIE];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    try {
      const payload = verifyAuthToken(token, config);

      if (typeof payload.sub !== 'string') {
        return res.status(401).json({
          message: 'Invalid session.',
        });
      }

      const user = await User.findById(payload.sub);

      if (!user || !user.isActive) {
        return res.status(401).json({
          message: 'Session is no longer valid.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'NotBeforeError' ||
        error.name === 'CastError'
      ) {
        return res.status(401).json({
          message: 'Invalid or expired session.',
        });
      }

      next(error);
    }
  };
}
