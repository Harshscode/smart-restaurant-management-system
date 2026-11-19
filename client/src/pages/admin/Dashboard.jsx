import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  PartyPopper,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import {
  StatusBadge,
  Spinner,
  ErrorPanel,
} from '../../components/common/Ui.jsx';
import { useLiveData } from '../../hooks/useLiveData.js';
import { getDashboard } from '../../services/restaurantService.js';
import { money, prettyDate } from '../../lib/format.js';

export default function Dashboard() {
  const {
    data,
    loading,
    error,
    refresh,
  } = useLiveData(getDashboard);

  if (error) {
    return <ErrorPanel message={error} refresh={refresh} />;
  }

  if (loading || !data) {
    return <Spinner label="Loading dashboard" />;
  }

  const summary = data.summary || {};
  const days = data.ordersLast7Days || [];
  const max = Math.max(
    ...days.map(day => day.count || 0),
    1,
  );

  const stats = [
    {
      label: 'Total orders',
      number: summary.totalOrders || 0,
      info: `${summary.pendingOrders || 0} in progress`,
      icon: ShoppingBag,
    },
    {
      label: 'Completed revenue',
      number: money(summary.completedRevenue || 0),
      info: `${money(summary.orderValue || 0)} total order value`,
      icon: CircleDollarSign,
    },
    {
      label: 'Table requests',
      number: summary.totalReservations || 0,
      info: `${summary.pendingReservations || 0} awaiting review`,
      icon: CalendarCheck,
    },
    {
      label: 'Event requests',
      number: summary.totalEvents || 0,
      info: `${summary.pendingEvents || 0} awaiting review`,
      icon: PartyPopper,
    },
    {
      label: 'Menu items',
      number: summary.menuItems || 0,
      info: `${summary.availableMenuItems || 0} currently available`,
      icon: UtensilsCrossed,
    },
    {
      label: 'Customers',
      number: summary.registeredCustomers || 0,
      info: 'Registered customer accounts',
      icon: Users,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">DASHBOARD / OVERVIEW</span>

          <h1>
            Good day, team <span className="wave">✳</span>
          </h1>

          <p>Live activity from the restaurant database.</p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => refresh(true)}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, number, info, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-card__top">
              <span>{label}</span>

              <span className="stat-card__icon">
                <Icon size={20} />
              </span>
            </div>

            <strong>{number}</strong>
            <small>{info}</small>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Orders at a glance</h2>
              <p>Orders placed over the last seven days</p>
            </div>

            <TrendingUp size={21} />
          </div>

          <div
            className="orders-chart"
            role="img"
            aria-label={`Orders last 7 days: ${days
              .map(day => `${day.date} ${day.count}`)
              .join(', ')}`}
          >
            {days.map(day => (
              <div
                key={day.date}
                className="orders-chart__column"
              >
                <strong>{day.count}</strong>

                <div className="orders-chart__bar-wrap">
                  <span
                    style={{
                      height: `${Math.max(
                        5,
                        ((day.count || 0) / max) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <small>
                  {new Date(
                    `${day.date}T12:00:00`,
                  ).toLocaleDateString('en-US', {
                    weekday: 'short',
                  })}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel dashboard-actions">
          <div className="admin-panel__header">
            <div>
              <h2>Quick actions</h2>
              <p>Go straight to what matters.</p>
            </div>
          </div>

          <Link to="/admin/menu">
            <span>
              <UtensilsCrossed size={19} />
            </span>

            <div>
              <strong>Update the menu</strong>
              <small>Manage dishes and availability</small>
            </div>

            <ArrowRight size={17} />
          </Link>

          <Link to="/admin/orders">
            <span>
              <ShoppingBag size={19} />
            </span>

            <div>
              <strong>Review orders</strong>
              <small>
                {summary.pendingOrders || 0} active orders
              </small>
            </div>

            <ArrowRight size={17} />
          </Link>

          <Link to="/admin/reservations">
            <span>
              <CalendarCheck size={19} />
            </span>

            <div>
              <strong>Table requests</strong>
              <small>
                {summary.pendingReservations || 0} awaiting review
              </small>
            </div>

            <ArrowRight size={17} />
          </Link>

          <Link to="/admin/events">
            <span>
              <PartyPopper size={19} />
            </span>

            <div>
              <strong>Event enquiries</strong>
              <small>
                {summary.pendingEvents || 0} awaiting review
              </small>
            </div>

            <ArrowRight size={17} />
          </Link>
        </section>
      </div>

      <div className="dashboard-main-grid dashboard-bottom-grid">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Recent orders</h2>
              <p>Latest customer activity</p>
            </div>

            <Link
              className="text-link"
              to="/admin/orders"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {(data.recentOrders || []).map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.reference}</strong>
                      <small>{prettyDate(order.createdAt)}</small>
                    </td>

                    <td>{order.customerName}</td>
                    <td>{money(order.total)}</td>

                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}

                {!data.recentOrders?.length && (
                  <tr>
                    <td colSpan="4">
                      No orders have been placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Upcoming reservations</h2>
              <p>Your next guests</p>
            </div>

            <Link
              className="text-link"
              to="/admin/reservations"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="reservation-mini-list">
            {(data.upcomingReservations || []).map(
              reservation => (
                <div key={reservation.id}>
                  <div className="reservation-mini-icon">
                    <CalendarCheck size={18} />
                  </div>

                  <div>
                    <strong>{reservation.name}</strong>

                    <small>
                      {prettyDate(reservation.date)} at{' '}
                      {reservation.time} · {reservation.guests}{' '}
                      guests
                    </small>
                  </div>

                  <StatusBadge status={reservation.status} />
                </div>
              ),
            )}

            {!data.upcomingReservations?.length && (
              <p>No upcoming reservations.</p>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-main-grid dashboard-bottom-grid">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Popular dishes</h2>
              <p>Calculated from real orders</p>
            </div>

            <Link
              className="text-link"
              to="/admin/menu"
            >
              View menu
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="reservation-mini-list">
            {(data.popularItems || []).map(item => (
              <div key={item.name}>
                <div className="reservation-mini-icon">
                  <UtensilsCrossed size={18} />
                </div>

                <div>
                  <strong>{item.name}</strong>
                  <small>{item.quantity} sold</small>
                </div>
              </div>
            ))}

            {!data.popularItems?.length && (
              <p>No sales data yet.</p>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Recent event requests</h2>
              <p>Latest private dining enquiries</p>
            </div>

            <Link
              className="text-link"
              to="/admin/events"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="reservation-mini-list">
            {(data.recentEvents || []).map(event => (
              <div key={event.id}>
                <div className="reservation-mini-icon">
                  <PartyPopper size={18} />
                </div>

                <div>
                  <strong>
                    {event.type} · {event.name}
                  </strong>

                  <small>
                    {prettyDate(event.date)} at {event.time} ·{' '}
                    {event.guests} guests
                  </small>
                </div>

                <StatusBadge status={event.status} />
              </div>
            ))}

            {!data.recentEvents?.length && (
              <p>No event requests yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}