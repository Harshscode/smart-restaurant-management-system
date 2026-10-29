import { useState } from 'react';
import { RefreshCw, Search, ShoppingBag } from 'lucide-react';
import { getOrders, setOrderStatus } from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import { useToast } from '../../context/ToastContext.jsx';
import { money, ORDER_STATUSES, prettyDate } from '../../lib/format.js';
import { ErrorPanel, Spinner, StatusBadge } from '../../components/common/Ui.jsx';

export default function AdminOrders() {
  const { data: orders, loading, error, refresh } = useLiveData(getOrders);
  const [status, setStatus] = useState('All'), [query, setQuery] = useState(''), [busy, setBusy] = useState(null);
  const toast = useToast();
  const filtered = (orders || []).filter(o => (status === 'All' || o.status === status) && `${o.reference} ${o.customer.name} ${o.customer.email}`.toLowerCase().includes(query.toLowerCase()));
  const change = async (id, value) => { setBusy(id); try { await setOrderStatus(id, value); toast('Order status updated.'); } catch (err) { toast(err.message, 'error'); } finally { setBusy(null); } };
  return <><div className="admin-page-header"><div><span className="eyebrow">RESTAURANT / ORDERS</span><h1>Order management</h1><p>Keep every order moving, from kitchen to customer.</p></div><button type="button" className="btn btn-outline btn-sm" onClick={() => refresh()}><RefreshCw size={16} /> Refresh</button></div>
    <div className="admin-panel admin-list-panel"><div className="admin-filter-row"><div className="admin-search"><Search size={18} /><input aria-label="Search orders" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search order or customer..." /></div><select aria-label="Filter order status" value={status} onChange={e => setStatus(e.target.value)}>{['All', ...ORDER_STATUSES].map(s => <option key={s}>{s}</option>)}</select><span className="admin-list-count">{filtered.length} orders</span></div>
      {error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner /> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Type</th><th>Amount</th><th>Status</th><th>Update status</th></tr></thead><tbody>{filtered.map(o => <tr key={o.id}><td><strong>{o.reference}</strong><small>{prettyDate(o.createdAt)}</small></td><td><strong>{o.customer.name}</strong><small>{o.customer.email}</small></td><td><div className="table-items">{o.items.map((line, index) => <span key={index}>{line.quantity}× {line.name}</span>)}</div></td><td><span className="capitalize">{o.fulfillment}</span></td><td><strong>{money(o.total)}</strong></td><td><StatusBadge status={o.status} /></td><td><select aria-label={`Update order ${o.reference}`} className="table-select" value={o.status} disabled={busy === o.id || o.status === 'Cancelled'} onChange={e => change(o.id, e.target.value)}>{ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{!filtered.length && <div className="admin-empty"><ShoppingBag size={29} /><p>No orders match those filters.</p></div>}</div>}
    </div><p className="admin-help">Updating an order changes its customer-facing tracking status in the same browser. A backend will synchronize different devices in the next phase.</p>
  </>;
}
