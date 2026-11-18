
import { randomUUID } from 'node:crypto';

import { MenuItem } from '../models/MenuItem.js';

import {
  createMenuSchema,
  updateMenuSchema,
  menuQuerySchema,
} from '../schemas/menuSchema.js';

function formatItem(document) {
  const value = document.toObject
    ? document.toObject()
    : document;

  const { _id, __v, ...item } = value;

  return item;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateId(req, res) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(req.params.id)) {
    res.status(400).json({
      message: 'Invalid menu item ID.',
    });
    return false;
  }

  return true;
}

export const menuController = {
  async list(req, res) {
    const result = menuQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid menu search parameters.',
      });
    }

    const { category, available, search } = result.data;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (available !== undefined) {
      filter.available = available === 'true';
    }

    if (search) {
      const pattern = new RegExp(
        escapeRegex(search),
        'i'
      );

      filter.$or = [
        { name: pattern },
        { description: pattern },
      ];
    }

    const items = await MenuItem.find(filter)
      .sort({ id: 1 })
      .lean();

    return res.json(items.map(formatItem));
  },

  async getOne(req, res) {
    if (!validateId(req, res)) return;

    const item = await MenuItem.findOne({
      id: req.params.id,
    }).lean();

    if (!item) {
      return res.status(404).json({
        message: 'Menu item not found.',
      });
    }

    return res.json(formatItem(item));
  },

  async create(req, res) {
    const result = createMenuSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid menu item.',
        errors: result.error.flatten().fieldErrors,
      });
    }

    const item = await MenuItem.create({
      id: `m_${randomUUID()}`,
      ...result.data,
    });

    return res.status(201).json(formatItem(item));
  },

  async update(req, res) {
    if (!validateId(req, res)) return;

    const result = updateMenuSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid menu update.',
        errors: result.error.flatten().fieldErrors,
      });
    }

    const item = await MenuItem.findOneAndUpdate(
      { id: req.params.id },
      { $set: result.data },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        message: 'Menu item not found.',
      });
    }

    return res.json(formatItem(item));
  },

  async remove(req, res) {
    if (!validateId(req, res)) return;

    const item = await MenuItem.findOneAndDelete({
      id: req.params.id,
    });

    if (!item) {
      return res.status(404).json({
        message: 'Menu item not found.',
      });
    }

    return res.json({
      message: 'Menu item deleted successfully.',
    });
  },
};
