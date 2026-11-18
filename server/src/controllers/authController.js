
import bcrypt from 'bcryptjs';

import { User } from '../models/User.js';

import {
  registerSchema,
  loginSchema,
} from '../schemas/authSchema.js';

import {
  AUTH_COOKIE,
  createAuthToken,
  authCookieOptions,
  publicUser,
} from '../lib/auth.js';

export function createAuthController(config) {
  async function register(req, res, next) {
    try {
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: 'Invalid registration details.',
          errors: result.error.flatten().fieldErrors,
        });
      }

      const { name, email, password, phone } = result.data;

      const existing = await User.exists({ email });

      if (existing) {
        return res.status(409).json({
          message: 'Account already exists.',
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        phone,
        passwordHash,
        role: 'customer',
        isActive: true,
      });

      const token = createAuthToken(user, config);

      res.cookie(
        AUTH_COOKIE,
        token,
        authCookieOptions(config)
      );

      return res.status(201).json({
        message: 'Registration successful.',
        user: publicUser(user),
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'Account already exists.',
        });
      }

      next(error);
    }
  }

  async function login(req, res, next) {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: 'Invalid login details.',
        });
      }

      const { email, password } = result.data;

      const user = await User.findOne({
        email,
        isActive: true,
      }).select('+passwordHash');

      const validPassword = user?.passwordHash
        ? await bcrypt.compare(password, user.passwordHash)
        : false;

      if (!validPassword) {
        return res.status(401).json({
          message: 'Invalid email or password.',
        });
      }

      const token = createAuthToken(user, config);

      res.cookie(
        AUTH_COOKIE,
        token,
        authCookieOptions(config)
      );

      return res.json({
        message: 'Login successful.',
        user: publicUser(user),
      });
    } catch (error) {
      next(error);
    }
  }

  function logout(req, res) {
    const {
      maxAge,
      ...clearOptions
    } = authCookieOptions(config);

    res.clearCookie(AUTH_COOKIE, clearOptions);

    return res.status(204).end();
  }

  function me(req, res) {
    return res.json({
      user: publicUser(req.user),
    });
  }

  function adminCheck(req, res) {
    return res.json({
      message: 'Admin access granted.',
      user: publicUser(req.user),
    });
  }

  return {
    register,
    login,
    logout,
    me,
    adminCheck,
  };
}
