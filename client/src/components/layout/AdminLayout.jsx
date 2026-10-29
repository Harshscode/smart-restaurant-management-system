import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, LayoutDashboard, LogOut, Menu, ShoppingBag, UtensilsCrossed, X, PartyPopper, Leaf, UsersRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Menu management', icon: UtensilsCrossed },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { to: '/admin/events', label: 'Event enquiries', icon: PartyPopper },
  { to: '/admin/users', label: 'Demo customers', icon: UsersRound },
];

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const logout = () => { signOut(); navigate('/admin/login', { replace: true }); };
  return <div className="admin-shell">
    <aside className={`admin-sidebar ${menuOpen ? 'admin-sidebar--open' : ''}`}>
      <Link to="/admin" className="admin-brand"><span><Leaf size={21} /></span><strong>copper<span>&</span>thyme</strong><small>OPERATIONS</small></Link>
      <div className="admin-sidebar__label">WORKSPACE</div>
      <nav className="admin-nav" aria-label="Admin navigation">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} />{label}</NavLink>)}</nav>
      <div className="admin-sidebar__bottom"><Link to="/" className="admin-sidebar__link"><ArrowLeft size={17} /> View restaurant</Link><button type="button" className="admin-sidebar__link" onClick={logout}><LogOut size={17} /> Sign out</button></div>
    </aside>
    {menuOpen && <button className="admin-scrim" type="button" aria-label="Close sidebar" onClick={() => setMenuOpen(false)} />}
    <div className="admin-main"><header className="admin-topbar"><button type="button" className="admin-mobile-toggle" onClick={() => setMenuOpen(x => !x)} aria-label="Toggle navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button><div><span className="admin-topbar__title">Restaurant operations</span><span className="admin-topbar__subtitle">Copper & Thyme · Frontend demonstration</span></div><div className="admin-avatar" title="Restaurant admin">CT</div></header><div className="admin-content"><Outlet /></div></div>
  </div>;
}
