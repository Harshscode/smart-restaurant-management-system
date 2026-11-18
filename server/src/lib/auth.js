
import jwt from 'jsonwebtoken';

export const AUTH_COOKIE = 'ct_auth';

const TOKEN_LIFETIME = 2 * 60 * 60 * 1000;

export function createAuthToken(user, config) {
  return jwt.sign(
    {},
    config.jwtSecret,
    {
      algorithm: 'HS256',
      subject: String(user._id),
      issuer: 'copper-thyme-api',
      audience: 'copper-thyme-web',
      expiresIn: '2h',
    }
  );
}

export function verifyAuthToken(token, config) {
  return jwt.verify(token, config.jwtSecret, {
    algorithms: ['HS256'],
    issuer: 'copper-thyme-api',
    audience: 'copper-thyme-web',
  });
}

export function authCookieOptions(config) {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_LIFETIME,
  };
}

export function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}
