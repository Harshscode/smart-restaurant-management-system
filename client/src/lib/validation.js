import { emailValid, phoneValid, localDateString } from './format.js';

export function validateContact(data) {
  const errors = {};
  if (!data.name?.trim() || data.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!emailValid(data.email)) errors.email = 'Enter a valid email address.';
  if (!phoneValid(data.phone)) errors.phone = 'Enter a valid phone number (at least 7 digits).';
  return errors;
}

export function validateCheckout(data, fulfillment = 'pickup') {
  const errors = validateContact(data);
  if (fulfillment === 'delivery' && (!data.address?.trim() || data.address.trim().length < 8)) errors.address = 'Enter a complete delivery address.';
  return errors;
}

function dateTimeValid(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) return false;
  const dt = new Date(`${date}T${time}:00`);
  return !Number.isNaN(dt.getTime()) && dt.getTime() > Date.now() + 30 * 60 * 1000 && dt.getFullYear() === Number(date.slice(0, 4)) && dt.getMonth() + 1 === Number(date.slice(5, 7)) && dt.getDate() === Number(date.slice(8, 10));
}

export function validateReservation(data) {
  const errors = validateContact(data);
  if (!dateTimeValid(data.date, data.time)) errors.date = 'Choose a future date and time (at least 30 minutes ahead).';
  if (!Number.isInteger(Number(data.guests)) || Number(data.guests) < 1 || Number(data.guests) > 12) errors.guests = 'Select between 1 and 12 guests.';
  if (data.time && (data.time < '12:00' || data.time > '21:00')) errors.time = 'Choose a time between 12:00 PM and 9:00 PM.';
  return errors;
}

export function validateEvent(data) {
  const errors = validateContact(data);
  if (!dateTimeValid(data.date, data.time)) errors.date = 'Choose a future event date and time.';
  if (!Number.isInteger(Number(data.guests)) || Number(data.guests) < 4 || Number(data.guests) > 100) errors.guests = 'Event size must be between 4 and 100 guests.';
  if (!data.type?.trim()) errors.type = 'Select an event type.';
  return errors;
}

export function validateMenuItem(data) {
  const errors = {};
  if (!data.name?.trim() || data.name.trim().length < 3) errors.name = 'Enter a dish name (at least 3 characters).';
  if (!['Starters', 'Mains', 'Desserts', 'Beverages'].includes(data.category)) errors.category = 'Choose a valid category.';
  if (!data.description?.trim() || data.description.trim().length < 10) errors.description = 'Description must be at least 10 characters.';
  if (!Number.isFinite(Number(data.price)) || Number(data.price) <= 0) errors.price = 'Price must be greater than zero.';
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) errors.ingredients = 'Add at least one ingredient.';
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
export const minimumBookingDate = () => localDateString();
