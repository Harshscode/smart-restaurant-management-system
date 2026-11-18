
const SAFE_METHODS = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
]);

export function protectWrites(config) {
  const allowedOrigins = new Set(config.origins);

  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const fetchSite = req.get('Sec-Fetch-Site');

    if (fetchSite === 'cross-site') {
      return res.status(403).json({
        message: 'Cross-site request rejected.',
      });
    }

    if (origin && !allowedOrigins.has(origin)) {
      return res.status(403).json({
        message: 'Request origin not allowed.',
      });
    }

    if (!origin && referer) {
      try {
        const refererOrigin = new URL(referer).origin;

        if (!allowedOrigins.has(refererOrigin)) {
          return res.status(403).json({
            message: 'Request origin not allowed.',
          });
        }
      } catch {
        return res.status(403).json({
          message: 'Invalid request origin.',
        });
      }
    }

    if (req.get('X-SRMS-Request') !== '1') {
      return res.status(403).json({
        message: 'Required request header missing.',
      });
    }

    next();
  };
}