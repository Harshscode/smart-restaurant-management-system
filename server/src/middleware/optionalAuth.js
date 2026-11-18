
import { AUTH_COOKIE } from '../lib/auth.js';

import { requireAuth } from './authenticate.js';

export function optionalAuth(config) {
  const authenticate = requireAuth(config);

  return (req, res, next) => {
    if (!req.cookies?.[AUTH_COOKIE]) {
      return next();
    }

    return authenticate(req, res, next);
  };
}
