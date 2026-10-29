import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Clock3, Leaf, MapPin, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/events', label: 'Events' },
  { to: '/concierge', label: 'Concierge' },
];

export default function SiteLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { count } = useCart();
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="site" id="top">
      <div className="announcement">
        Fresh food. Shared moments. <Link to="/reservations">Plan a visit <ArrowUpRight size={13} /></Link>
      </div>
      <header className="site-header">
        <div className="container header-content">
          <Link className="brand" to="/" aria-label="Copper and Thyme homepage">
            <span className="brand-icon"><Leaf size={23} strokeWidth={1.7} /></span>
            <span className="brand-type">copper<span>&amp;</span>thyme<small>THE ART OF GATHERING</small></span>
          </Link>
          <nav className={mobileOpen ? 'site-nav site-nav--open' : 'site-nav'} aria-label="Primary navigation">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'site-nav-active' : undefined}>{label}</NavLink>
            ))}
            <Link className="mobile-extra-link" to="/cart" onClick={() => setMobileOpen(false)}>Shopping bag ({count})</Link>
            <Link className="mobile-extra-link" to="/track" onClick={() => setMobileOpen(false)}>Track an order</Link>
            <Link className="mobile-extra-link" to="/account/login" onClick={() => setMobileOpen(false)}>My account</Link>
          </nav>
          <div className="ct-header-tools">
            <Link className="ct-header-cart" to="/cart" aria-label={`Shopping bag, ${count} items`}>
              <ShoppingBag size={20} />
              {count > 0 && <span className="ct-cart-count">{count}</span>}
            </Link>
            <Link to="/menu" className="header-cta">Order online <ArrowUpRight size={17} /></Link>
            <button className="mobile-toggle" type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)}>
              {mobileOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <span className="footer-brand">copper<span>&amp;</span>thyme</span>
            <p>Thoughtfully prepared food and warm hospitality, for moments worth sharing.</p>
          </div>
          <div className="ct-footer-links">
            <h3>Explore</h3>
            <Link to="/about">Our story</Link>
            <Link to="/menu">Our menu</Link>
            <Link to="/reservations">Reserve a table</Link>
            <Link to="/events">Private events</Link>
            <Link to="/concierge">Menu concierge</Link>
          </div>
          <div className="ct-footer-links">
            <h3>Helpful links</h3>
            <Link to="/cart">Your cart</Link>
            <Link to="/track">Track order</Link>
            <Link to="/account/login">My account (demo)</Link>
            <Link to="/admin/login">Staff portal (demo)</Link>
            <p><MapPin size={16} /> Sample restaurant location</p>
            <p><Clock3 size={16} /> Daily 12:00 PM - 10:00 PM</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>Copper &amp; Thyme — Frontend demonstration</span><span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
