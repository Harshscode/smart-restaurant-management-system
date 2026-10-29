
import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import About from '../pages/customer/About.jsx';

describe('About page', () => {
  it('renders the restaurant story and core values', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    expect(html).toContain('A place to belong');
    expect(html).toContain('OUR STORY');
    expect(html).toContain('Fresh by nature');
    expect(html).toContain('Hospitality first');
  });
});
