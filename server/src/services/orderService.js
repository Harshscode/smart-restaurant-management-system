
import { MenuItem } from '../models/MenuItem.js';

const dollars = cents => cents / 100;

export async function priceOrderLines(lines, fulfillment) {
  const menu = await MenuItem.find({
    id: { $in: lines.map(line => line.id) },
    available: true,
  }).lean();

  const byId = new Map(
    menu.map(dish => [dish.id, dish])
  );

  let subtotalCents = 0;

  const items = lines.map(line => {
    const dish = byId.get(line.id);

    if (!dish) {
      const error = new Error(
        'One or more selected dishes are unavailable.'
      );
      error.status = 409;
      throw error;
    }

    const unitCents = Math.round(dish.price * 100);

    subtotalCents += unitCents * line.quantity;

    return {
      menuItemId: dish.id,
      name: dish.name,
      price: dollars(unitCents),
      quantity: line.quantity,
    };
  });

  const taxCents = Math.round(subtotalCents * 0.08);

  const deliveryCents =
    fulfillment === 'delivery' ? 399 : 0;

  return {
    items,
    subtotal: dollars(subtotalCents),
    tax: dollars(taxCents),
    deliveryFee: dollars(deliveryCents),
    total: dollars(
      subtotalCents + taxCents + deliveryCents
    ),
  };
}