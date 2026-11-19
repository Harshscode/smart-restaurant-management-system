import { useState } from 'react';
import {
  RefreshCw,
  Search,
  ShoppingBag,
} from 'lucide-react';
import {
  getOrders,
  setOrderStatus,
} from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  money,
  ORDER_STATUSES,
  prettyDate,
} from '../../lib/format.js';
import {
  ErrorPanel,
  Spinner,
  StatusBadge,
} from '../../components/common/Ui.jsx';

const orderStatusOptions = {
  Placed: ['Placed', 'Preparing', 'Cancelled'],
  Preparing: ['Preparing', 'Ready', 'Cancelled'],
  Ready: ['Ready', 'Delivered', 'Cancelled'],
  Delivered: ['Delivered'],
  Cancelled: ['Cancelled'],
};

export default function AdminOrders() {
  const {
    data: orders,
    loading,
    error,
    refresh,
  } = useLiveData(getOrders);

  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(null);

  const toast = useToast();

  const filtered = (orders || []).filter(
    order =>
      (status === 'All' || order.status === status) &&
      `${order.reference} ${order.customer.name} ${order.customer.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const change = async (id, value) => {
    setBusy(id);

    try {
      await setOrderStatus(id, value);
      await refresh(true);
      toast('Order status updated.');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">RESTAURANT / ORDERS</span>
          <h1>Order management</h1>
          <p>Keep every order moving, from kitchen to customer.</p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => refresh()}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-panel admin-list-panel">
        <div className="admin-filter-row">
          <div className="admin-search">
            <Search size={18} />

            <input
              aria-label="Search orders"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search order or customer..."
            />
          </div>

          <select
            aria-label="Filter order status"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {['All', ...ORDER_STATUSES].map(value => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <span className="admin-list-count">
            {filtered.length} orders
          </span>
        </div>

        {error ? (
          <ErrorPanel message={error} refresh={refresh} />
        ) : loading ? (
          <Spinner />
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.reference}</strong>
                      <small>{prettyDate(order.createdAt)}</small>
                    </td>

                    <td>
                      <strong>{order.customer.name}</strong>
                      <small>{order.customer.email}</small>
                    </td>

                    <td>
                      <div className="table-items">
                        {order.items.map((line, index) => (
                          <span key={index}>
                            {line.quantity}× {line.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <span className="capitalize">
                        {order.fulfillment}
                      </span>
                    </td>

                    <td>
                      <strong>{money(order.total)}</strong>
                    </td>

                    <td>
                      <StatusBadge status={order.status} />
                    </td>

                    <td>
                      <select
                        aria-label={`Update order ${order.reference}`}
                        className="table-select"
                        value={order.status}
                        disabled={
                          busy === order.id ||
                          ['Delivered', 'Cancelled'].includes(order.status)
                        }
                        onChange={e =>
                          change(order.id, e.target.value)
                        }
                      >
                        {(
                          orderStatusOptions[order.status] || [
                            order.status,
                          ]
                        ).map(value => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filtered.length && (
              <div className="admin-empty">
                <ShoppingBag size={29} />
                <p>No orders match those filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="admin-help">
        Order updates are saved in MongoDB and appear in customer tracking
        after refresh.
      </p>
    </>
  );
}