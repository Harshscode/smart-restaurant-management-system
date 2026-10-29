import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../pages/customer/Home.jsx';

describe('Homepage', () => {
  it('shows the brand story and guest favorites', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('Where good food');
    expect(html).toContain('Garden Greens');
    expect(html).toContain('Chocolate Lava Cake');
  });
});
