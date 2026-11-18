
import { randomBytes, randomUUID } from 'node:crypto';

import { Order } from '../models/Order.js';
import { priceOrderLines } from '../services/orderService.js';

import {
  createOrderSchema,
  updateOrderItemsSchema,
  updateOrderStatusSchema,
  trackOrderSchema,
} from '../schemas/orderSchema.js';

const transitions = {
  Placed: ['Preparing', 'Cancelled'],
  Preparing: ['Ready', 'Cancelled'],
  Ready: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

function sendValidationError(res, result) {
  return res.status(400).json({
    message: 'Invalid order information.',
    errors: result.error.flatten(),
  });
}

function validateId(req, res) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(req.params.id)) {
    res.status(400).json({
      message: 'Invalid order ID.',
    });
    return false;
  }

  return true;
}

function formatOrder(document) {
  const o = document.toObject
    ? document.toObject()
    : document;

  return {
    id: o.id,
    reference: o.reference,
    userId: o.userId ? String(o.userId) : null,
    customer: o.customer,
    items: o.items,
    fulfillment: o.fulfillment,
    notes: o.notes,
    subtotal: o.subtotal,
    tax: o.tax,
    deliveryFee: o.deliveryFee,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function parsePagination(req, res) {
  const allowed = new Set([
    'page',
    'limit',
    'status',
  ]);

  if (
    Object.keys(req.query).some(
      key => !allowed.has(key)
    )
  ) {
    res.status(400).json({
      message: 'Invalid query parameters.',
    });
    return null;
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
    res.status(400).json({
      message: 'Invalid pagination.',
    });
    return null;
  }

  if (
    req.query.status &&
    !Object.keys(transitions).includes(req.query.status)
  ) {
    res.status(400).json({
      message: 'Invalid order status filter.',
    });
    return null;
  }

  return {
    page,
    limit,
    status: req.query.status,
  };
}

async function listOrders(req, res, filter) {
  const options = parsePagination(req, res);
  if (!options) return;

  const where = { ...filter };

  if (options.status) {
    where.status = options.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(where)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .lean(),

    Order.countDocuments(where),
  ]);

  return res.json({
    orders: orders.map(formatOrder),
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      pages: Math.ceil(total / options.limit),
    },
  });
}

export const orderController = {
  // Create a new order
  async create(req, res) {
    const result = createOrderSchema.safeParse(req.body);

    if (!result.success) {
      return sendValidationError(res, result);
    }

    const input = result.data;

    if (
      req.user &&
      input.customer.email !== req.user.email
    ) {
      return res.status(403).json({
        message: 'Use your account email when ordering.',
      });
    }

    const priced = await priceOrderLines(
      input.items,
      input.fulfillment
    );

    const order = await Order.create({
      id: `order_${randomUUID()}`,
      reference:
        `CT-${randomBytes(7).toString('hex').toUpperCase()}`,
      userId: req.user?._id ?? null,
      customer: {
        ...input.customer,
        address:
          input.fulfillment === 'delivery'
            ? input.customer.address
            : '',
      },
      fulfillment: input.fulfillment,
      notes: input.notes,
      ...priced,
      status: 'Placed',
    });

    return res.status(201).json(
      formatOrder(order)
    );
  },

  // Guest order tracking
  async track(req, res) {
    const result = trackOrderSchema.safeParse(req.body);

    if (!result.success) {
      return sendValidationError(res, result);
    }

    const order = await Order.findOne({
      reference: result.data.reference,
      'customer.email': result.data.email,
    }).lean();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    const formatted = formatOrder(order);

    return res.json({
      id: formatted.id,
      reference: formatted.reference,
      customer: {
        email: formatted.customer.email,
      },
      items: formatted.items,
      fulfillment: formatted.fulfillment,
      subtotal: formatted.subtotal,
      tax: formatted.tax,
      deliveryFee: formatted.deliveryFee,
      total: formatted.total,
      status: formatted.status,
      createdAt: formatted.createdAt,
      updatedAt: formatted.updatedAt,
    });
  },

  // Logged-in customer's order history
  async mine(req, res) {
    return listOrders(req, res, {
      userId: req.user._id,
    });
  },

  // Admin: All orders
  async list(req, res) {
    return listOrders(req, res, {});
  },

  // Owner or admin: View one order
  async getOne(req, res) {
    if (!validateId(req, res)) return;

    const filter = {
      id: req.params.id,
    };

    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const order = await Order.findOne(filter).lean();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    return res.json(formatOrder(order));
  },

  // Owner: Add, remove or change item quantities
  async updateItems(req, res) {
    if (!validateId(req, res)) return;

    const result = updateOrderItemsSchema.safeParse(
      req.body
    );

    if (!result.success) {
      return sendValidationError(res, result);
    }

    const order = await Order.findOne({
      id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    if (order.status !== 'Placed') {
      return res.status(409).json({
        message: 'Order can no longer be edited.',
      });
    }

    const priced = await priceOrderLines(
      result.data.items,
      order.fulfillment
    );

    const updated = await Order.findOneAndUpdate(
      {
        id: order.id,
        userId: req.user._id,
        status: 'Placed',
      },
      { $set: priced },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(409).json({
        message: 'Order status changed. Try again.',
      });
    }

    return res.json(formatOrder(updated));
  },

  // Owner: Cancel before preparation
  async cancel(req, res) {
    if (!validateId(req, res)) return;

    const order = await Order.findOne({
      id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    if (order.status !== 'Placed') {
      return res.status(409).json({
        message: 'This order can no longer be cancelled.',
      });
    }

    const cancelled = await Order.findOneAndUpdate(
      {
        id: order.id,
        userId: req.user._id,
        status: 'Placed',
      },
      {
        $set: {
          status: 'Cancelled',
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!cancelled) {
      return res.status(409).json({
        message: 'Order status changed. Try again.',
      });
    }

    return res.json(formatOrder(cancelled));
  },

  // Admin: Update preparation and delivery status
  async updateStatus(req, res) {
    if (!validateId(req, res)) return;

    const result = updateOrderStatusSchema.safeParse(
      req.body
    );

    if (!result.success) {
      return sendValidationError(res, result);
    }

    const order = await Order.findOne({
      id: req.params.id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    if (
      !transitions[order.status]?.includes(
        result.data.status
      )
    ) {
      return res.status(409).json({
        message: 'Invalid order status transition.',
      });
    }

    const updated = await Order.findOneAndUpdate(
      {
        id: order.id,
        status: order.status,
      },
      {
        $set: {
          status: result.data.status,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(409).json({
        message: 'Order status changed. Try again.',
      });
    }

    return res.json(formatOrder(updated));
  },
};
