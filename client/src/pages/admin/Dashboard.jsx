import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CircleDollarSign, ClipboardList, PartyPopper, RefreshCw, ShoppingBag, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { StatusBadge, Spinner, ErrorPanel } from '../../components/common/Ui.jsx';
import { useLiveData } from '../../hooks/useLiveData.js';
import { getDashboard, resetDemoData } from '../../services/restaurantService.js';
import { money, prettyDate, addDays } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Dashboard() {
  const { data, loading, error, refresh } = useLiveData(getDashboard);
  const notify = useToast();
  const reset = async () => { if (!window.confirm('Restore the original sample menu, orders, and bookings? This removes your local demo changes.')) return; try { await resetDemoData(); notify('Sample data restored.'); window.location.reload(); } catch (err) { notify(err.message, 'error'); } };
  if (error) return <ErrorPanel message={error} refresh={refresh} />;
  if (loading || !data) return <Spinner label="Loading dashboard" />;
  const stats = [
    { label: 'Total orders', number: data.orders.length, info: `${data.pendingOrders} in progress`, icon: ShoppingBag },
    { label: 'Order value', number: money(data.totalRevenue), info: 'Excludes cancelled orders', icon: CircleDollarSign },
    { label: 'Table requests', number: data.reservations.length, info: `${data.pendingReservations} awaiting review`, icon: CalendarCheck },
    { label: 'Menu items', number: data.menu.length, info: `${data.menu.filter(x => x.available).length} currently available`, icon: UtensilsCrossed },
  ];
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(i - 6);
    return { date, count: data.orders.filter(o => o.createdAt.slice(0, 10) === date).length, label: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }) };
  });
  const max = Math.max(...days.map(d => d.count), 1);
  return <><div className="admin-page-header"><div><span className="eyebrow">DASHBOARD / OVERVIEW</span><h1>Good day, team <span className="wave">✳</span></h1><p>Here's what's happening at Copper & Thyme.</p></div><button type="button" className="btn btn-outline btn-sm" onClick={() => refresh()}><RefreshCw size={16} /> Refresh</button></div>
    <div className="stats-grid">{stats.map(({ label, number, info, icon: Icon }) => <div className="stat-card" key={label}><div className="stat-card__top"><span>{label}</span><span className="stat-card__icon"><Icon size={20} /></span></div><strong>{number}</strong><small>{info}</small></div>)}</div>
    <div className="dashboard-main-grid"><section className="admin-panel"><div className="admin-panel__header"><div><h2>Orders at a glance</h2><p>Number of orders placed over the last 7 days</p></div><TrendingUp size={21} /></div><div className="orders-chart" role="img" aria-label={`Orders last 7 days: ${days.map(d => `${d.label} ${d.count}`).join(', ')}`}>
      {days.map(d => <div key={d.date} className="orders-chart__column"><strong>{d.count}</strong><div className="orders-chart__bar-wrap"><span style={{ height: `${Math.max(5, d.count / max * 100)}%` }} /></div><small>{d.label}</small></div>)}
    </div></section><section className="admin-panel dashboard-actions"><div className="admin-panel__header"><div><h2>Quick actions</h2><p>Go straight to what matters.</p></div></div><Link to="/admin/menu"><span><UtensilsCrossed size={19} /></span><div><strong>Update the menu</strong><small>Manage dishes and availability</small></div><ArrowRight size={17} /></Link><Link to="/admin/orders"><span><ShoppingBag size={19} /></span><div><strong>Review orders</strong><small>{data.pendingOrders} active orders</small></div><ArrowRight size={17} /></Link><Link to="/admin/reservations"><span><CalendarCheck size={19} /></span><div><strong>Table requests</strong><small>{data.pendingReservations} awaiting review</small></div><ArrowRight size={17} /></Link><Link to="/admin/events"><span><PartyPopper size={19} /></span><div><strong>Event enquiries</strong><small>{data.pendingEvents} awaiting review</small></div><ArrowRight size={17} /></Link></section></div>
    <div className="dashboard-main-grid dashboard-bottom-grid"><section className="admin-panel"><div className="admin-panel__header"><div><h2>Recent orders</h2><p>Latest customer activity</p></div><Link className="text-link" to="/admin/orders">View all <ArrowRight size={15} /></Link></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data.orders.slice(0, 5).map(o => <tr key={o.id}><td><strong>{o.reference}</strong><small>{prettyDate(o.createdAt)}</small></td><td>{o.customer.name}</td><td>{money(o.total)}</td><td><StatusBadge status={o.status} /></td></tr>)}</tbody></table></div></section>
      <section className="admin-panel"><div className="admin-panel__header"><div><h2>Upcoming reservations</h2><p>Your next guests</p></div><Link className="text-link" to="/admin/reservations">View all <ArrowRight size={15} /></Link></div><div className="reservation-mini-list">{data.reservations.filter(r => r.status !== 'Cancelled').slice(0, 5).map(r => <div key={r.id}><div className="reservation-mini-icon"><CalendarCheck size={18} /></div><div><strong>{r.name}</strong><small>{prettyDate(r.date)} at {r.time} · {r.guests} guests</small></div><StatusBadge status={r.status} /></div>)}{data.reservations.filter(r => r.status !== 'Cancelled').length === 0 && <p>No upcoming reservations.</p>}</div></section></div>
    <div className="admin-demo-tools"><div><strong>Sample data controls</strong><p>This is a frontend demonstration. Your changes are saved in this browser only.</p></div><button className="btn btn-outline btn-sm" type="button" onClick={reset}><RefreshCw size={15} /> Restore demo data</button></div>
  </>;
}
