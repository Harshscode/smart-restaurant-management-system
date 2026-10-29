import { money } from '../lib/format.js';

export const QUICK_QUESTIONS = [
  "What's popular?", 'Vegetarian options', 'Something spicy under $25',
  'Gluten-free options', 'Dessert recommendations', 'Opening hours',
];

const dishList = (items) => items.slice(0, 3).map(i => `${i.name} (${money(i.price)})`).join(', ');

// A local, rule-based menu concierge: works without external credentials or APIs.
export function getConciergeReply(question, menu) {
  const text = String(question || '').toLowerCase().trim();
  const available = menu.filter(item => item.available);
  if (!text) return 'Tell me what you are in the mood for, and I will find a dish for you.';
  if (/hello|^hi$|^hey$|good (morning|evening)/.test(text)) return 'Welcome to Copper & Thyme! I can help with menu recommendations, dietary options, restaurant hours, and reservations.';
  if (/hour|open|clos|timing/.test(text)) return 'Our sample dining hours are 12:00 PM–10:00 PM daily. Table bookings are accepted between 12:00 PM and 9:00 PM.';
  if (/reserv|book|table/.test(text)) return 'You can reserve a table from the Reservations page. Choose your date, time, and party size, and we will confirm your request.';
  if (/last (time|order)|previous order|order history/.test(text)) return 'To protect your information, please check your past order using its reference and email on the Track Order page.';
  if (/allerg|nut|dairy|ingredient/.test(text) && !/gluten/.test(text)) return 'Each dish card lists ingredients and common allergens. For severe allergies, please confirm directly with restaurant staff before ordering; cross-contact is possible.';

  const diet = /gluten[ -]?free|celiac|coeliac/.test(text) ? 'Gluten-Free' : /vegan/.test(text) ? 'Vegan' : /vegetarian|veggie|no meat/.test(text) ? 'Vegetarian' : null;
  const budgetMatch = text.match(/(?:under|below|less than|within|\$)\s*\$?(\d+(?:\.\d{1,2})?)/);
  const maxPrice = budgetMatch ? Number(budgetMatch[1]) : Infinity;
  let choices = available.filter(item => item.price <= maxPrice && (!diet || item.dietary.includes(diet)));
  if (/spicy|hot|chilli|chili/.test(text)) choices = choices.filter(item => item.heat > 0).sort((a, b) => b.heat - a.heat);
  if (/dessert|sweet|cake|chocolate/.test(text)) choices = choices.filter(item => item.category === 'Desserts');
  if (/drink|beverage|coffee|mocktail/.test(text)) choices = choices.filter(item => item.category === 'Beverages');
  if (/special/.test(text)) choices = choices.filter(item => item.featured);
  if (/popular|recommend|best|favorite|favourite/.test(text)) choices = choices.sort((a, b) => Number(b.popular) - Number(a.popular));
  if (diet || Number.isFinite(maxPrice) || /spicy|dessert|sweet|cake|chocolate|drink|beverage|coffee|mocktail|special|popular|recommend|best|favorite|favourite/.test(text)) {
    if (!choices.length) return 'I could not find a current menu item matching all those preferences. Try relaxing a filter or browsing the full menu.';
    return `You might enjoy ${dishList(choices)}. Open the menu to view ingredients and allergen information before ordering.`;
  }
  return 'I can recommend dishes by dietary preference, spice level, or budget. Try “vegetarian under $25” or “what dessert do you recommend?”';
}
