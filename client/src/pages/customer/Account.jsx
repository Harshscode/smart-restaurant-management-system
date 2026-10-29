import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getOrders, getReservations, getEvents } from '../../services/restaurantService.js';
import { PageHeader, StatusBadge } from '../../components/common/Ui.jsx';
import { money, prettyDate } from '../../lib/format.js';

const tabs = [ ['orders', 'Orders'], ['reservations', 'Reservations'], ['events', 'Events'], ['profile', 'Profile'] ];
export default function Account() {
  const { user, saveProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [records, setRecords] = useState({ orders: [], reservations: [], events: [] });
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  async function refresh() {
    setLoading(true);
    try {
      const [orders, reservations, events] = await Promise.all([getOrders(), getReservations(), getEvents()]);
      const matches = row => row.customer?.email?.toLowerCase() === user.email || row.email?.toLowerCase() === user.email;
      setRecords({ orders: orders.filter(matches), reservations: reservations.filter(matches), events: events.filter(matches) });
      setStatus('');
    } catch (error) { setStatus(error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, [user.email]);
  function update(event) {
    event.preventDefault();
    try { saveProfile({ name, phone }); setStatus('Profile preview updated.'); }
    catch (error) { setStatus(error.message); }
  }
  return <>
    <PageHeader eyebrow="CUSTOMER ACCOUNT PREVIEW" title={<>Welcome, <em>{user.name.split(' ')[0]}.</em></>} description="Browse orders and booking requests made using this demo email." />
    <section className="section"><div className="container ct-account-content">
      <div className="ct-demo-note"><strong>Local preview:</strong> Records are saved in this browser, not to a real customer account or restaurant server. They are not protected by authentication.</div>
      <div className="ct-account-actions">
        <div className="ct-account-tabs" role="group" aria-label="Account sections">{tabs.map(([id,label]) => <button type="button" key={id} className={tab === id ? 'active' : ''} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div>
        <div style={{ display:'flex', gap:8 }}><button className="btn btn-outline btn-sm" type="button" onClick={refresh}><RefreshCw size={15} /> Refresh</button><button className="btn btn-outline btn-sm" type="button" onClick={() => { signOut(); navigate('/account/login', { replace:true }); }}><LogOut size={15} /> Sign out</button></div>
      </div>
      {status && <p role="status" className="ct-demo-note">{status}</p>}
      {loading ? <p>Loading saved demo records...</p> : (
        tab === 'profile' ? <div className="ct-profile-grid"><form className="booking-form" onSubmit={update}><h2>Contact details</h2><div className="form-field"><label htmlFor="profile-name">Full name</label><input id="profile-name" value={name} minLength={2} required onChange={e => setName(e.target.value)} /></div><div className="form-field"><label htmlFor="profile-email">Email</label><input id="profile-email" value={user.email} readOnly /></div><div className="form-field"><label htmlFor="profile-phone">Phone</label><input id="profile-phone" value={phone} onChange={e => setPhone(e.target.value)} /></div><button className="btn btn-primary" type="submit">Save demo details</button></form><div className="ct-record"><h3>Frontend preview</h3><p>Your local demo details are not secure and cannot be used to sign in to the real backend.</p><Link to="/menu" className="text-link">Return to menu</Link></div></div> :
        records[tab].length ? <div className="ct-record-grid">{records[tab].map(row => <article className="ct-record" key={row.id}><div style={{ display:'flex',justifyContent:'space-between',gap:12 }}><strong>{row.reference || row.type || 'Request'}</strong><StatusBadge status={row.status} /></div><small>{prettyDate(row.createdAt || row.date)}</small>{tab === 'orders' ? <p>{row.items.map(i => `${i.quantity} × ${i.name}`).join(', ')} — {money(row.total)}</p> : <p>{row.date} at {row.time} • {row.guests} guests</p>}{tab === 'orders' && <Link className="text-link" to="/track" state={{ order:row }}>Track this order</Link>}</article>)}</div>
        : <div className="ct-account-empty"><h3>Nothing saved here yet</h3><p>Place an order or make a booking using <strong>{user.email}</strong> to see it in this preview.</p><Link to={tab === 'orders' ? '/menu' : tab === 'events' ? '/events' : '/reservations'} className="btn btn-primary">{tab === 'orders' ? 'Browse menu' : 'Start a booking'}</Link></div>
      )}
    </div></section>
  </>;
}
