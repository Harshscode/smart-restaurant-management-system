import { describe, expect, it } from 'vitest';
import { starterMenu } from '../data/menu.js';
import { getConciergeReply } from '../services/conciergeService.js';

describe('menu concierge', () => {
  it('finds vegetarian dishes', () => {
    const reply = getConciergeReply('What vegetarian meals do you have?', starterMenu);
    expect(reply).toContain('Burrata');
  });
  it('finds gluten-free items', () => {
    const reply = getConciergeReply('gluten free options', starterMenu);
    expect(reply).toContain('Garden Greens');
  });
  it('handles a budget and spicy preference', () => {
    const reply = getConciergeReply('something spicy under $25', starterMenu);
    expect(reply).toContain('Harissa Cauliflower');
  });
  it('does not expose previous order information without verification', () => {
    const reply = getConciergeReply('what did I order last time?', starterMenu);
    expect(reply).toContain('reference and email');
  });
  it('answers opening hours', () => {
    expect(getConciergeReply('what time do you open?', starterMenu)).toContain('12:00 PM');
  });
});
