import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Clock3, Leaf, MapPin, Menu, X } from 'lucide-react';

const sections = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Our kitchen', href: '/#discover' },
  { label: 'Visit', href: '/#visit' },
];

export default function SiteLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileOpen(false), [location.pathname]);
  return (
    <div className="site" id="top">
      <div className="announcement">
        Seasonal food. Shared moments. <a href="#visit">Plan a visit <ArrowUpRight size={13} /></a>
      </div>
      <header className="site-header">
        <div className="container header-content">
          <Link className="brand" to="/" aria-label="Copper and Thyme home">
            <span className="brand-icon"><Leaf size={23} strokeWidth={1.7} /></span>
            <span className="brand-type">copper<span>&amp;</span>thyme<small>THE ART OF GATHERING</small></span>
          </Link>
          <nav className={mobileOpen ? 'site-nav site-nav--open' : 'site-nav'} aria-label="Primary navigation">
            {sections.map(section => (
              <a key={section.href} href={section.href} onClick={() => setMobileOpen(false)}>{section.label}</a>
            ))}
          </nav>
          <a href="#visit" className="header-cta">Visit us <ArrowUpRight size={17} /></a>
          <button className="mobile-toggle" type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)}>
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      <main id="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <span className="footer-brand">copper<span>&amp;</span>thyme</span>
            <p>Thoughtfully prepared food and warm hospitality, for moments worth sharing.</p>
          </div>
          <div><h3>Discover</h3><a href="#discover">Our kitchen</a><a href="#story">Our story</a></div>
          <div><h3>Plan a visit</h3><p><MapPin size={16} /> Sample restaurant location</p><p><Clock3 size={16} /> Daily 12:00 PM - 10:00 PM</p></div>
        </div>
        <div className="container footer-bottom">Copper &amp; Thyme - Restaurant management project <span>{new Date().getFullYear()}</span></div>
      </footer>
    </div>
  );
}
