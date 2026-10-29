import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, ShoppingBag, Store, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLiveData } from '../../hooks/useLiveData.js';
import { getMenu, placeOrder } from '../../services/restaurantService.js';
import { calculateTotals, money } from '../../lib/format.js';
import { hasErrors, validateCheckout } from '../../lib/validation.js';
import { Field, PageHeader, Spinner, SummaryLine, ErrorPanel } from '../../components/common/Ui.jsx';

export default function Checkout() {
  const navigate = useNavigate();
  const notify = useToast();
  const { items, clearCart } = useCart();
  const { data: menu, loading, error, refresh } = useLiveData(getMenu);
  const [fulfillment, setFulfillment] = useState('pickup');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const update = e => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setErrors(prev => ({ ...prev, [e.target.name]: undefined })); };
  const lines = items.map(line => ({ ...menu?.find(m => m.id === line.id), id: line.id, quantity: line.quantity }));
  const available = lines.length > 0 && lines.every(line => line.name && line.available);
  const totals = calculateTotals(lines.filter(line => line.price), fulfillment);
  const submit = async e => {
    e.preventDefault();
    const nextErrors = validateCheckout(form, fulfillment);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    if (!available) { notify('Some selected items are unavailable. Please review your bag.', 'error'); return; }
    setSubmitting(true);
    try {
      const order = await placeOrder({ customer: form, fulfillment, notes: form.notes, items });
      clearCart();
      navigate('/track', { state: { order }, replace: true });
    } catch (err) { setErrors(err.fields || {}); notify(err.message, 'error'); }
    finally { setSubmitting(false); }
  };
  return <><PageHeader eyebrow="ALMOST THERE" title={<>Let's make it <em>official.</em></>} description="Just a few details before your food is on its way." /><section className="section checkout-page"><div className="container">
    {error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner label="Loading checkout" /> : !items.length ? <div className="empty-checkout"><ShoppingBag size={38} /><h2>Your bag is empty</h2><p>You'll need a few dishes before you can check out.</p><Link className="btn btn-primary" to="/menu">Explore the menu <ArrowRight size={17} /></Link></div> :
      <div className="checkout-layout"><form onSubmit={submit} className="checkout-form" noValidate><div className="checkout-form__panel"><span className="form-step">01 / ORDER TYPE</span><h2>How would you like your food?</h2><div className="fulfillment-grid"><button type="button" className={`fulfillment-option ${fulfillment === 'pickup' ? 'active' : ''}`} onClick={() => setFulfillment('pickup')}><Store size={25} /><strong>Pickup</strong><span>Collect your food fresh</span></button><button type="button" className={`fulfillment-option ${fulfillment === 'delivery' ? 'active' : ''}`} onClick={() => setFulfillment('delivery')}><Truck size={25} /><strong>Delivery</strong><span>Brought to your door · $3.99</span></button></div></div>
        <div className="checkout-form__panel"><span className="form-step">02 / YOUR DETAILS</span><h2>Who are we cooking for?</h2><div className="form-grid"><Field label="Full name" name="name" required error={errors.name}><input id="name" name="name" autoComplete="name" value={form.name} onChange={update} placeholder="e.g. Alex Morgan" /></Field><Field label="Email address" name="email" required error={errors.email}><input id="email" type="email" name="email" autoComplete="email" value={form.email} onChange={update} placeholder="alex@example.com" /></Field><Field label="Phone number" name="phone" required error={errors.phone}><input id="phone" type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={update} placeholder="(555) 123-4567" /></Field>{fulfillment === 'delivery' && <Field label="Delivery address" name="address" required error={errors.address}><input id="address" name="address" autoComplete="street-address" value={form.address} onChange={update} placeholder="Street, city, ZIP" /></Field>}</div><Field label="Special instructions (optional)" name="notes"><textarea id="notes" name="notes" value={form.notes} onChange={update} maxLength={600} rows={3} placeholder="Anything we should know about your order?" /></Field></div>
        <div className="checkout-form__panel"><span className="form-step">03 / CONFIRMATION</span><h2>Ready when you are.</h2><div className="checkout-notice"><MapPin size={20} /><div><strong>{fulfillment === 'pickup' ? 'Pickup from Copper & Thyme' : 'Delivery to your address'}</strong><p>This is a simulated checkout. No actual payment will be taken or delivery arranged.</p></div></div><button type="submit" className="btn btn-primary btn-block" disabled={submitting || !available}>{submitting ? 'Placing your order...' : `Place order · ${money(totals.total)}`}<ArrowRight size={17} /></button><Link className="checkout-back" to="/cart"><ArrowLeft size={15} /> Back to bag</Link></div>
      </form><aside className="order-summary checkout-summary"><h2>Your order</h2>{lines.map(line => <div key={line.id} className="checkout-order-line"><span>{line.quantity}× {line.name || 'Unavailable item'}</span><strong>{money((line.price || 0) * line.quantity)}</strong></div>)}<div className="order-summary__rule" /><SummaryLine label="Subtotal" value={money(totals.subtotal)} /><SummaryLine label="Estimated tax" value={money(totals.tax)} /><SummaryLine label="Delivery" value={fulfillment === 'pickup' ? 'Free' : money(totals.deliveryFee)} /><div className="order-summary__rule" /><SummaryLine label="Total" value={money(totals.total)} strong /></aside></div>}
  </div></section></>;
}
