
import bcrypt from 'bcryptjs';

import { User } from '../models/User.js';

import {
  AUTH_COOKIE,
  authCookieOptions,
  publicUser,
} from '../lib/auth.js';

import {
  createUserSchema,
  updateProfileSchema,
  updateUserSchema,
} from '../schemas/userSchema.js';

function validId(req, res) {
  if (!/^[0-9a-f]{24}$/i.test(req.params.id)) {
    res.status(400).json({
      message: 'Invalid user ID.',
    });
    return false;
  }

  return true;
}

function validationError(res, result) {
  return res.status(400).json({
    message: 'Invalid user information.',
    errors: result.error.flatten().fieldErrors,
  });
}

function adminUser(user) {
  return {
    ...publicUser(user),
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function createUserController(config) {
  return {
    // View own profile
    async me(req, res) {
      return res.json({
        user: publicUser(req.user),
      });
    },

    // Update own profile
    async updateMe(req, res) {
      const result = updateProfileSchema.safeParse(req.body);

      if (!result.success) {
        return validationError(res, result);
      }

      req.user.set(result.data);
      await req.user.save();

      return res.json({
        user: publicUser(req.user),
      });
    },

    // Deactivate own customer account
    async deleteMe(req, res) {
      if (req.user.role === 'admin') {
        return res.status(403).json({
          message: 'Administrators cannot deactivate their own account.',
        });
      }

      req.user.isActive = false;
      await req.user.save();

      const { maxAge, ...options } = authCookieOptions(config);
      res.clearCookie(AUTH_COOKIE, options);

      return res.status(204).end();
    },

    // Admin: List users with pagination
    async list(req, res) {
      if (
        Object.keys(req.query).some(
          key => !['page', 'limit'].includes(key)
        )
      ) {
        return res.status(400).json({
          message: 'Invalid list parameters.',
        });
      }

      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);

      if (
        !Number.isSafeInteger(page) ||
        page < 1 ||
        page > 10000 ||
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        return res.status(400).json({
          message: 'Invalid pagination values.',
        });
      }

      const [users, total] = await Promise.all([
        User.find()
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),

        User.countDocuments(),
      ]);

      return res.json({
        users: users.map(adminUser),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    },

    // Admin: Get one user
    async getOne(req, res) {
      if (!validId(req, res)) return;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }

      return res.json({
        user: adminUser(user),
      });
    },

    // Admin: Create a user account
    async create(req, res) {
      const result = createUserSchema.safeParse(req.body);

      if (!result.success) {
        return validationError(res, result);
      }

      const { password, ...fields } = result.data;

      const passwordHash = await bcrypt.hash(
        password,
        12
      );

      const user = await User.create({
        ...fields,
        passwordHash,
        isActive: true,
      });

      return res.status(201).json({
        user: adminUser(user),
      });
    },

    // Admin: Update user information
    async update(req, res) {
      if (!validId(req, res)) return;

      const result = updateUserSchema.safeParse(req.body);

      if (!result.success) {
        return validationError(res, result);
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }

      // Prevent administrators removing their own access.
      if (
        String(user._id) === String(req.user._id) &&
        (
          result.data.isActive === false ||
          (
            result.data.role &&
            result.data.role !== 'admin'
          )
        )
      ) {
        return res.status(403).json({
          message: 'Administrators cannot remove their own access.',
        });
      }

      user.set(result.data);
      await user.save();

      return res.json({
        user: adminUser(user),
      });
    },

    // Admin: Deactivate another user
    async remove(req, res) {
      if (!validId(req, res)) return;

      if (
        req.params.id.toLowerCase() ===
        String(req.user._id).toLowerCase()
      ) {
        return res.status(403).json({
          message: 'Administrators cannot deactivate their own account.',
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }

      if (user.isActive) {
        user.isActive = false;
        await user.save();
      }

      return res.status(204).end();
    },
  };
}
