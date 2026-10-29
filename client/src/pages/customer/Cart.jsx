import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { getMenu } from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import { money, calculateTotals } from '../../lib/format.js';
import { EmptyState, FoodImage, PageHeader, Spinner, SummaryLine, ErrorPanel } from '../../components/common/Ui.jsx';

export default function Cart() {
  const { items, removeItem, setQuantity } = useCart();
  const { data: menu, loading, error, refresh } = useLiveData(getMenu);
  const lines = items.map(line => ({ ...(menu || []).find(m => m.id === line.id), id: line.id, quantity: line.quantity })).filter(line => line.name);
  const unavailable = lines.some(line => !line.available) || items.some(line => !(menu || []).find(m => m.id === line.id));
  const totals = calculateTotals(lines);
  return <><PageHeader eyebrow="YOUR SELECTION" title={<>A little something <em>delicious.</em></>} description="Your next good meal is just a few clicks away." /><section className="section cart-page"><div className="container">
    {error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner label="Loading bag" /> : !items.length ? <EmptyState icon={ShoppingBag} title="Your bag is waiting" description="Explore the menu and add something delicious to get started." action={{ to: '/menu', label: 'Browse our menu' }} /> : <div className="cart-layout"><div className="cart-list"><div className="cart-list__heading"><h2>Your bag <span>({items.length} items)</span></h2><Link to="/menu" className="text-link"><ArrowLeft size={16} /> Keep exploring</Link></div>
      {lines.map(line => <article className="cart-line" key={line.id}><FoodImage src={line.image} alt={line.name} /><div className="cart-line__body"><span>{line.category}</span><h3>{line.name}</h3><p>{line.description}</p>{!line.available && <small className="field-error">Currently unavailable</small>}<button type="button" onClick={() => removeItem(line.id)} className="cart-remove"><Trash2 size={14} /> Remove</button></div><div className="cart-line__end"><strong>{money(line.price * line.quantity)}</strong><div className="quantity-control"><button type="button" onClick={() => line.quantity === 1 ? removeItem(line.id) : setQuantity(line.id, line.quantity - 1)} aria-label={`Decrease ${line.name} quantity`}><Minus size={15} /></button><span>{line.quantity}</span><button type="button" disabled={line.quantity >= 20} onClick={() => setQuantity(line.id, line.quantity + 1)} aria-label={`Increase ${line.name} quantity`}><Plus size={15} /></button></div></div></article>)}
      {items.length !== lines.length && <div className="notice-banner">Some items were removed from the menu. Please remove them from your bag before checkout. {items.filter(x => !lines.some(l => l.id === x.id)).map(x => <button className="btn btn-sm btn-outline" type="button" key={x.id} onClick={() => removeItem(x.id)}>Remove unavailable item</button>)}</div>}
    </div><aside className="order-summary"><h2>Order summary</h2><SummaryLine label="Subtotal" value={money(totals.subtotal)} /><SummaryLine label="Estimated tax (8%)" value={money(totals.tax)} /><div className="order-summary__rule" /><SummaryLine label="Estimated total" value={money(totals.total)} strong /><small>Delivery fee (if applicable) is calculated at checkout.</small><Link to="/checkout" className={`btn btn-primary btn-block ${unavailable ? 'is-disabled' : ''}`} aria-disabled={unavailable} onClick={e => { if (unavailable) e.preventDefault(); }}>Continue to checkout <ArrowRight size={17} /></Link><p className="order-summary__assurance">Prepared with care, delivered with a smile.</p></aside></div>}
  </div></section></>;
}
