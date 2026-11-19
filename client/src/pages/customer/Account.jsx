import { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';
import {
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../services/apiClient.js';
import {
  PageHeader,
  StatusBadge,
} from '../../components/common/Ui.jsx';
import {
  money,
  prettyDate,
} from '../../lib/format.js';

const tabs = [
  ['orders', 'Orders'],
  ['reservations', 'Reservations'],
  ['events', 'Events'],
  ['profile', 'Profile'],
];

export default function Account() {
  const {
    user,
    refreshProfile,
    saveProfile,
    signOut,
  } = useAuth();

  const navigate = useNavigate();

  const [tab, setTab] = useState('orders');
  const [records, setRecords] = useState({
    orders: [],
    reservations: [],
    events: [],
  });
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(
    user.phone || ''
  );
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] =
    useState(false);
  const [orderCount, setOrderCount] =
    useState(0);

  async function refresh() {
    setLoading(true);
    setStatus('');

    try {
      const [
        profile,
        orderResponse,
        reservations,
        events,
      ] = await Promise.all([
        refreshProfile(),
        apiRequest(
          '/api/orders/mine?page=1&limit=100'
        ),
        apiRequest('/api/reservations/mine'),
        apiRequest('/api/events/mine'),
      ]);

      setName(profile.name);
      setPhone(profile.phone || '');

      setOrderCount(
        orderResponse.pagination?.total ??
        orderResponse.orders.length
      );

      setRecords({
        orders: orderResponse.orders || [],
        reservations: Array.isArray(reservations)
          ? reservations
          : [],
        events: Array.isArray(events)
          ? events
          : [],
      });
    } catch (error) {
      setStatus(
        error.message ||
        'Unable to load account data.'
      );
    } finally {
      setLoading(false);
    }
  }

  // The MongoDB user ID remains stable when profile details change.
  useEffect(() => {
    void refresh();
  }, [user.id]);

  async function update(event) {
    event.preventDefault();

    setSaving(true);
    setStatus('');

    try {
      const profile = await saveProfile({
        name,
        phone,
      });

      setName(profile.name);
      setPhone(profile.phone || '');

      setStatus(
        'Your profile was updated in MongoDB.'
      );
    } catch (error) {
      setStatus(
        error.message ||
        'Unable to save profile.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setSigningOut(true);
    setStatus('');

    try {
      await signOut();

      navigate('/account/login', {
        replace: true,
      });
    } catch (error) {
      setStatus(
        error.message ||
        'Unable to sign out.'
      );

      setSigningOut(false);
    }
  }

  const items = records[tab] || [];

  const action =
    tab === 'orders'
      ? '/menu'
      : tab === 'events'
        ? '/events'
        : '/reservations';

  return (
    <>
      <PageHeader
        eyebrow="MY ACCOUNT"
        title={
          <>
            Welcome,{' '}
            <em>{user.name.split(' ')[0]}.</em>
          </>
        }
        description="Your account profile, orders, reservations and event requests."
      />

      <section className="section">
        <div className="container ct-account-content">
          <div className="ct-account-actions">
            <div
              className="ct-account-tabs"
              role="group"
              aria-label="Account sections"
            >
              {tabs.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className={
                    tab === id ? 'active' : ''
                  }
                  aria-pressed={tab === id}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={logout}
                disabled={signingOut}
              >
                <LogOut size={15} />

                {signingOut
                  ? 'Signing out...'
                  : 'Sign out'}
              </button>
            </div>
          </div>

          {status && (
            <p
              className="ct-demo-note"
              role="status"
            >
              {status}
            </p>
          )}

          {loading ? (
            <p role="status">
              Loading your account records...
            </p>
          ) : tab === 'profile' ? (
            <div className="ct-profile-grid">
              <form
                className="booking-form"
                onSubmit={update}
              >
                <h2>Contact details</h2>

                <div className="form-field">
                  <label htmlFor="profile-name">
                    Full name
                  </label>

                  <input
                    id="profile-name"
                    value={name}
                    minLength={2}
                    maxLength={80}
                    required
                    onChange={event =>
                      setName(event.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="profile-email">
                    Email address
                  </label>

                  <input
                    id="profile-email"
                    value={user.email}
                    readOnly
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="profile-phone">
                    Phone number
                  </label>

                  <input
                    id="profile-phone"
                    type="tel"
                    maxLength={25}
                    value={phone}
                    onChange={event =>
                      setPhone(event.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : 'Save profile'}
                </button>
              </form>

              <div className="ct-record">
                <h3>Secure account</h3>

                <p>
                  Your profile is stored in MongoDB.
                  Your login is maintained using an
                  HttpOnly session cookie.
                </p>

                <Link
                  to="/menu"
                  className="text-link"
                >
                  Explore the menu
                </Link>
              </div>
            </div>
          ) : items.length ? (
            <>
              {tab === 'orders' &&
                orderCount > items.length && (
                  <p>
                    Showing the latest {items.length} of{' '}
                    {orderCount} orders.
                  </p>
                )}

              <div className="ct-record-grid">
                {items.map(row => (
                  <article
                    className="ct-record"
                    key={row.id}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: 12,
                      }}
                    >
                      <strong>
                        {row.reference ||
                          row.type ||
                          'Request'}
                      </strong>

                      <StatusBadge
                        status={row.status}
                      />
                    </div>

                    <small>
                      {prettyDate(
                        row.createdAt || row.date
                      )}
                    </small>

                    {tab === 'orders' ? (
                      <p>
                        {row.items
                          .map(
                            line =>
                              `${line.quantity} x ${line.name}`
                          )
                          .join(', ')}
                        {' — '}
                        {money(row.total)}
                      </p>
                    ) : (
                      <p>
                        {row.date} at {row.time}
                        {' · '}
                        {row.guests} guests
                      </p>
                    )}

                    {tab === 'orders' && (
                      <Link
                        className="text-link"
                        to="/track"
                        state={{ order: row }}
                      >
                        Track this order
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="ct-account-empty">
              <h3>Nothing saved here yet</h3>

              <p>
                This section shows records saved by the
                backend while I were authenticated.
              </p>

              <p>
                The current demo checkout and booking
                forms still use browser storage until
                their API integration stage. Earlier
                guest records are not automatically
                attached.
              </p>

              <Link
                to={action}
                className="btn btn-primary"
              >
                {tab === 'orders'
                  ? 'Browse menu'
                  : 'Start a booking'}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}