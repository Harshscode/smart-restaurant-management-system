import { apiRequest } from './apiClient.js';

function listQuery(options = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString();
  return suffix ? '?' + suffix : '';
}

function menuPayload(input) {
  return {
    name: String(input.name || '').trim(),
    category: input.category,
    description: String(input.description || '').trim(),
    ingredients: Array.isArray(input.ingredients) ? input.ingredients : [],
    allergens: Array.isArray(input.allergens) ? input.allergens : [],
    dietary: Array.isArray(input.dietary) ? input.dietary : [],
    price: Number(input.price),
    available: Boolean(input.available),
    popular: Boolean(input.popular),
    featured: Boolean(input.featured),
    heat: Number(input.heat || 0),
    image: String(input.image || '').trim(),
  };
}

export async function getMenu(options = {}) {
  return apiRequest('/api/menu' + listQuery(options));
}

export async function getMenuItem(id) {
  return apiRequest('/api/menu/' + encodeURIComponent(id));
}

export async function saveMenuItem(input, id = null) {
  return apiRequest(
    id
      ? '/api/menu/' + encodeURIComponent(id)
      : '/api/menu',
    {
      method: id ? 'PATCH' : 'POST',
      body: menuPayload(input),
    }
  );
}

export async function deleteMenuItem(id) {
  return apiRequest(
    '/api/menu/' + encodeURIComponent(id),
    { method: 'DELETE' }
  );
}

export async function getOrders(options = {}) {
  const limit = options.limit || 100;
  const firstPage = options.page || 1;

  const result = await apiRequest(
    '/api/orders' + listQuery({
      page: firstPage,
      limit,
      status: options.status,
    })
  );

  const orders = [...(result.orders || [])];

  if (!options.page && result.pagination?.pages > 1) {
    for (
      let page = 2;
      page <= result.pagination.pages;
      page += 1
    ) {
      const next = await apiRequest(
        '/api/orders' + listQuery({
          page,
          limit,
          status: options.status,
        })
      );

      orders.push(...(next.orders || []));
    }
  }

  return orders;
}

export async function placeOrder(input) {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: {
      customer: {
        name: String(input.customer?.name || '').trim(),
        email: String(input.customer?.email || '')
          .trim()
          .toLowerCase(),
        phone: String(input.customer?.phone || '').trim(),
        address: String(input.customer?.address || '').trim(),
      },
      fulfillment: input.fulfillment,
      items: (input.items || []).map(line => ({
        id: line.id || line.menuItemId,
        quantity: Number(line.quantity),
      })),
      notes: String(input.notes || '').trim(),
    },
  });
}

export async function findOrder(reference, email) {
  try {
    return await apiRequest('/api/orders/track', {
      method: 'POST',
      body: {
        reference: String(reference || '')
          .trim()
          .toUpperCase(),
        email: String(email || '')
          .trim()
          .toLowerCase(),
      },
    });
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function updateOrderItems(id, items) {
  return apiRequest(
    '/api/orders/' + encodeURIComponent(id) + '/items',
    {
      method: 'PATCH',
      body: {
        items: items.map(line => ({
          id: line.id || line.menuItemId,
          quantity: Number(line.quantity),
        })),
      },
    }
  );
}

export async function cancelOrder(id) {
  return apiRequest(
    '/api/orders/' + encodeURIComponent(id) + '/cancel',
    { method: 'PATCH' }
  );
}

export async function setOrderStatus(id, status) {
  return apiRequest(
    '/api/orders/' + encodeURIComponent(id) + '/status',
    {
      method: 'PATCH',
      body: { status },
    }
  );
}

function reservationPayload(input) {
  return {
    name: String(input.name || '').trim(),
    email: String(input.email || '')
      .trim()
      .toLowerCase(),
    phone: String(input.phone || '').trim(),
    date: input.date,
    time: input.time,
    guests: Number(input.guests),
    seating: input.seating || 'Dining Room',
    notes: String(input.notes || '').trim(),
  };
}

export async function getReservations() {
  return apiRequest('/api/reservations');
}

export async function reserveTable(input) {
  return apiRequest('/api/reservations', {
    method: 'POST',
    body: reservationPayload(input),
  });
}

export async function lookupReservation(reference, email) {
  try {
    return await apiRequest('/api/reservations/lookup', {
      method: 'POST',
      body: {
        reference: String(reference || '')
          .trim()
          .toUpperCase(),
        email: String(email || '')
          .trim()
          .toLowerCase(),
      },
    });
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function updateReservation(id, changes) {
  const allowed = {};

  for (const key of [
    'date',
    'time',
    'guests',
    'seating',
    'notes',
  ]) {
    if (changes[key] !== undefined) {
      allowed[key] =
        key === 'guests'
          ? Number(changes[key])
          : changes[key];
    }
  }

  return apiRequest(
    '/api/reservations/' + encodeURIComponent(id),
    {
      method: 'PATCH',
      body: allowed,
    }
  );
}

export async function cancelReservation(id) {
  return apiRequest(
    '/api/reservations/' +
      encodeURIComponent(id) +
      '/cancel',
    { method: 'PATCH' }
  );
}

export async function setReservationStatus(id, status) {
  return apiRequest(
    '/api/reservations/' +
      encodeURIComponent(id) +
      '/status',
    {
      method: 'PATCH',
      body: { status },
    }
  );
}

function eventPayload(input) {
  return {
    name: String(input.name || '').trim(),
    email: String(input.email || '')
      .trim()
      .toLowerCase(),
    phone: String(input.phone || '').trim(),
    type: input.type,
    date: input.date,
    time: input.time,
    guests: Number(input.guests),
    menuPreference: String(
      input.menuPreference || ''
    ).trim(),
    notes: String(input.notes || '').trim(),
  };
}

export async function getEvents() {
  return apiRequest('/api/events');
}

export async function requestEvent(input) {
  return apiRequest('/api/events', {
    method: 'POST',
    body: eventPayload(input),
  });
}

export async function lookupEvent(reference, email) {
  try {
    return await apiRequest('/api/events/lookup', {
      method: 'POST',
      body: {
        reference: String(reference || '')
          .trim()
          .toUpperCase(),
        email: String(email || '')
          .trim()
          .toLowerCase(),
      },
    });
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function updateEvent(id, changes) {
  const allowed = {};

  for (const key of [
    'type',
    'date',
    'time',
    'guests',
    'menuPreference',
    'notes',
  ]) {
    if (changes[key] !== undefined) {
      allowed[key] =
        key === 'guests'
          ? Number(changes[key])
          : changes[key];
    }
  }

  return apiRequest(
    '/api/events/' + encodeURIComponent(id),
    {
      method: 'PATCH',
      body: allowed,
    }
  );
}

export async function cancelEvent(id) {
  return apiRequest(
    '/api/events/' +
      encodeURIComponent(id) +
      '/cancel',
    { method: 'PATCH' }
  );
}

export async function setEventStatus(id, status) {
  return apiRequest(
    '/api/events/' +
      encodeURIComponent(id) +
      '/status',
    {
      method: 'PATCH',
      body: { status },
    }
  );
}

export async function getDashboard() {
  return apiRequest('/api/admin/dashboard');
}