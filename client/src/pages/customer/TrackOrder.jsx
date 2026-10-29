import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck, Clock3, PackageCheck, RefreshCw, Search, ShoppingBag, Truck } from 'lucide-react';
import { PageHeader, Field, StatusBadge, SummaryLine } from '../../components/common/Ui.jsx';
import { findOrder } from '../../services/restaurantService.js';
import { money, prettyDate } from '../../lib/format.js';

const steps = [{ label: 'Placed', icon: ClipboardCheck }, { label: 'Preparing', icon: Clock3 }, { label: 'Ready', icon: PackageCheck }, { label: 'Delivered', icon: Truck }];

export default function TrackOrder() {
  const location = useLocation();
  const initial = location.state?.order || null;
  const [order, setOrder] = useState(initial);
  const [reference, setReference] = useState(initial?.reference || '');
  const [email, setEmail] = useState(initial?.customer.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lookup = async (event) => {
    event?.preventDefault(); setError('');
    if (!reference.trim() || !email.trim()) { setError('Enter your reference and email address.'); return; }
    setLoading(true);
    try { const result = await findOrder(reference, email); if (result) { setOrder(result); } else { setOrder(null); setError('No matching order found. Check your reference and email.'); } }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  const activeIndex = steps.findIndex(step => step.label === order?.status);
  return <><PageHeader eyebrow="ORDER UPDATES" title={<>Every good meal <em>has a journey.</em></>} description="Enter your order details to see how things are coming along." /><section className="section tracking-page"><div className="container tracking-container">
    <form onSubmit={lookup} className="track-form"><div className="track-form__intro"><h2>Find your order</h2><p>Use the reference from your order confirmation.</p></div><div className="track-form__fields"><Field label="Order reference" name="reference"><input id="reference" value={reference} onChange={e => setReference(e.target.value)} placeholder="CT-XXXXXXXXX" /></Field><Field label="Email used at checkout" name="track-email"><input id="track-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></Field><button type="submit" className="btn btn-primary" disabled={loading}><Search size={17} />{loading ? 'Looking up...' : 'Track order'}</button></div>{error && <p className="field-error" role="alert">{error}</p>}</form>
    {order ? <div className="tracking-result"><div className="tracking-result__top"><div><span className="eyebrow">ORDER {order.reference}</span><h2>{order.status === 'Cancelled' ? 'Your order was cancelled.' : 'Thanks for ordering with us!'}</h2><p>Placed on {prettyDate(order.createdAt)} · {order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</p></div><StatusBadge status={order.status} /></div>
      {order.status !== 'Cancelled' && <div className="order-progress">{steps.map(({ label, icon: Icon }, index) => <div key={label} className={`order-progress__step ${index <= activeIndex ? 'complete' : ''}`}><span className="order-progress__icon">{index < activeIndex ? <CheckCircle2 size={19} /> : <Icon size={19} />}</span><span>{order.fulfillment === 'pickup' && label === 'Delivered' ? 'Collected' : label}</span></div>)}</div>}
      <div className="tracking-result__bottom"><div><h3>Order details</h3>{order.items.map((line, index) => <div key={`${line.menuItemId}-${index}`} className="checkout-order-line"><span>{line.quantity}× {line.name}</span><strong>{money(line.price * line.quantity)}</strong></div>)}<div className="order-summary__rule" /><SummaryLine label="Total" value={money(order.total)} strong /></div><div className="tracking-result__actions"><p>Order status is updated by the restaurant team. Refresh to see the latest information.</p><button type="button" className="btn btn-outline" onClick={lookup} disabled={loading}><RefreshCw size={16} /> Refresh status</button></div></div>
    </div> : <div className="tracking-helper"><ShoppingBag size={27} /><h3>Your next favorite is waiting.</h3><p>Haven't placed an order yet? Find something delicious.</p><Link to="/menu" className="text-link">Explore our menu <ArrowRight size={16} /></Link></div>}
  </div></section></>;
}
