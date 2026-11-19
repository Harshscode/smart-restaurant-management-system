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
    deactivateAccount,
    signOut,
  } = useAuth();

  const navigate = useNavigate();

  const [tab, setTab] =
    useState('orders');

  const [records, setRecords] =
    useState({
      orders: [],
      reservations: [],
      events: [],
    });

  const [name, setName] =
    useState(user.name);

  const [phone, setPhone] =
    useState(user.phone || '');

  const [status, setStatus] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    signingOut,
    setSigningOut,
  ] = useState(false);

  const [
    orderCount,
    setOrderCount,
  ] = useState(0);

  const [busyId, setBusyId] =
    useState('');

  const [
    orderDrafts,
    setOrderDrafts,
  ] = useState({});

  const [editing, setEditing] =
    useState(null);

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

        apiRequest(
          '/api/reservations/mine'
        ),

        apiRequest('/api/events/mine'),
      ]);

      setName(profile.name);
      setPhone(profile.phone || '');

      const orders = [
        ...(orderResponse.orders || []),
      ];

      for (
        let page = 2;
        page <=
        (orderResponse.pagination?.pages ||
          1);
        page += 1
      ) {
        const next = await apiRequest(
          `/api/orders/mine?page=${page}&limit=100`
        );

        orders.push(
          ...(next.orders || [])
        );
      }

      setOrderCount(
        orderResponse.pagination?.total ??
          orders.length
      );

      setRecords({
        orders,

        reservations:
          Array.isArray(reservations)
            ? reservations
            : [],

        events:
          Array.isArray(events)
            ? events
            : [],
      });

      setOrderDrafts(
        Object.fromEntries(
          orders.map(order => [
            order.id,

            Object.fromEntries(
              order.items.map(item => [
                item.menuItemId,
                item.quantity,
              ])
            ),
          ])
        )
      );
    } catch (error) {
      setStatus(
        error.message ||
          'Unable to load account data.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [user.id]);

  async function updateProfile(
    event
  ) {
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

  async function deactivate() {
    if (
      !window.confirm(
        'Deactivate your account? You will be signed out and will need an administrator to reactivate it.'
      )
    ) {
      return;
    }

    setSaving(true);
    setStatus('');

    try {
      await deactivateAccount();

      navigate('/account/login', {
        replace: true,
      });
    } catch (error) {
      setStatus(
        error.message ||
          'Unable to deactivate your account.'
      );

      setSaving(false);
    }
  }

  async function saveOrderItems(
    order
  ) {
    setBusyId(order.id);
    setStatus('');

    try {
      const items = order.items
        .map(item => ({
          id: item.menuItemId,

          quantity: Number(
            orderDrafts[order.id]?.[
              item.menuItemId
            ] ?? item.quantity
          ),
        }))
        .filter(
          item =>
            Number.isInteger(
              item.quantity
            ) &&
            item.quantity > 0
        );

      if (!items.length) {
        throw new Error(
          'Keep at least one item, or cancel the order instead.'
        );
      }

      await apiRequest(
        `/api/orders/${encodeURIComponent(
          order.id
        )}/items`,
        {
          method: 'PATCH',
          body: {
            items,
          },
        }
      );

      await refresh();

      setStatus(
        `${order.reference} was updated and repriced by the server.`
      );
    } catch (error) {
      setStatus(
        error.message ||
          'Unable to update the order.'
      );
    } finally {
      setBusyId('');
    }
  }

  async function cancelRecord(
    kind,
    row
  ) {
    if (
      !window.confirm(
        `Cancel ${
          row.reference ||
          'this request'
        }?`
      )
    ) {
      return;
    }

    setBusyId(row.id);
    setStatus('');

    try {
      await apiRequest(
        `/api/${kind}/${encodeURIComponent(
          row.id
        )}/cancel`,
        {
          method: 'PATCH',
        }
      );

      await refresh();

      setStatus(
        `${
          row.reference || 'Request'
        } was cancelled.`
      );
    } catch (error) {
      setStatus(
        error.message ||
          'Unable to cancel this record.'
      );
    } finally {
      setBusyId('');
    }
  }

  function beginEdit(kind, row) {
    setEditing({
      kind,
      id: row.id,
      reference: row.reference,
      date: row.date,
      time: row.time,
      guests: row.guests,

      ...(kind === 'reservations'
        ? {
            seating:
              row.seating ||
              'Dining Room',
          }
        : {
            type:
              row.type || 'Other',
          }),
    });
  }

  async function saveBooking(
    event
  ) {
    event.preventDefault();

    setBusyId(editing.id);
    setStatus('');

    try {
      const body = {
        date: editing.date,
        time: editing.time,
        guests: Number(
          editing.guests
        ),

        ...(editing.kind ===
        'reservations'
          ? {
              seating:
                editing.seating,
            }
          : {
              type: editing.type,
            }),
      };

      await apiRequest(
        `/api/${
          editing.kind
        }/${encodeURIComponent(
          editing.id
        )}`,
        {
          method: 'PATCH',
          body,
        }
      );

      setEditing(null);

      await refresh();

      setStatus(
        `${editing.reference} was updated and returned to pending review when required.`
      );
    } catch (error) {
      setStatus(
        error.message ||
          'Unable to update this booking.'
      );
    } finally {
      setBusyId('');
    }
  }

  const items =
    records[tab] || [];

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
            <em>
              {
                user.name.split(
                  ' '
                )[0]
              }
              .
            </em>
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
              {tabs.map(
                ([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    className={
                      tab === id
                        ? 'active'
                        : ''
                    }
                    aria-pressed={
                      tab === id
                    }
                    onClick={() =>
                      setTab(id)
                    }
                  >
                    {label}
                  </button>
                )
              )}
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
                <RefreshCw
                  size={15}
                />
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
              Loading your account
              records...
            </p>
          ) : tab === 'profile' ? (
            <div className="ct-profile-grid">
              <form
                className="booking-form"
                onSubmit={
                  updateProfile
                }
              >
                <h2>
                  Contact details
                </h2>

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
                      setName(
                        event.target
                          .value
                      )
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
                      setPhone(
                        event.target
                          .value
                      )
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
                <h3>
                  Secure account
                </h3>

                <p>
                  Your profile is
                  stored in MongoDB.
                  Your login is
                  maintained using an
                  HttpOnly session
                  cookie.
                </p>

                <Link
                  to="/menu"
                  className="text-link"
                >
                  Explore the menu
                </Link>

                <hr />

                <h3>
                  Deactivate account
                </h3>

                <p>
                  This disables future
                  logins. An
                  administrator can
                  reactivate the
                  account.
                </p>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={deactivate}
                  disabled={saving}
                >
                  Deactivate my account
                </button>
              </div>
            </div>
          ) : items.length ? (
            <>
              {tab === 'orders' &&
                orderCount >
                  items.length && (
                  <p>
                    Showing the latest{' '}
                    {items.length} of{' '}
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
                        status={
                          row.status
                        }
                      />
                    </div>

                    <small>
                      {prettyDate(
                        row.createdAt ||
                          row.date
                      )}
                    </small>

                    {tab ===
                    'orders' ? (
                      <>
                        <div>
                          {row.items.map(
                            line => (
                              <div
                                key={
                                  line.menuItemId
                                }
                                style={{
                                  display:
                                    'flex',
                                  alignItems:
                                    'center',
                                  justifyContent:
                                    'space-between',
                                  gap: 12,
                                  marginTop: 8,
                                }}
                              >
                                <span>
                                  {
                                    line.name
                                  }
                                </span>

                                {row.status ===
                                'Placed' ? (
                                  <input
                                    aria-label={`Quantity for ${line.name}; use zero to remove`}
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={
                                      orderDrafts[
                                        row
                                          .id
                                      ]?.[
                                        line
                                          .menuItemId
                                      ] ??
                                      line.quantity
                                    }
                                    onChange={event =>
                                      setOrderDrafts(
                                        current => ({
                                          ...current,

                                          [row.id]:
                                            {
                                              ...current[
                                                row
                                                  .id
                                              ],

                                              [line.menuItemId]:
                                                event
                                                  .target
                                                  .value,
                                            },
                                        })
                                      )
                                    }
                                    style={{
                                      width: 72,
                                    }}
                                  />
                                ) : (
                                  <span>
                                    ×{' '}
                                    {
                                      line.quantity
                                    }
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        <p>
                          <strong>
                            {money(
                              row.total
                            )}
                          </strong>
                        </p>

                        <div
                          style={{
                            display:
                              'flex',
                            flexWrap:
                              'wrap',
                            gap: 8,
                          }}
                        >
                          <Link
                            className="text-link"
                            to="/track"
                            state={{
                              order: row,
                            }}
                          >
                            Track this
                            order
                          </Link>

                          {row.status ===
                            'Placed' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={
                                  busyId ===
                                  row.id
                                }
                                onClick={() =>
                                  saveOrderItems(
                                    row
                                  )
                                }
                              >
                                Save
                                quantities
                              </button>

                              <small>
                                Set a
                                quantity
                                to 0 to
                                remove
                                that
                                item.
                              </small>

                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={
                                  busyId ===
                                  row.id
                                }
                                onClick={() =>
                                  cancelRecord(
                                    'orders',
                                    row
                                  )
                                }
                              >
                                Cancel
                                order
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    ) : editing?.id ===
                      row.id ? (
                      <form
                        className="booking-form"
                        onSubmit={
                          saveBooking
                        }
                      >
                        <div className="form-field">
                          <label
                            htmlFor={`edit-date-${row.id}`}
                          >
                            Date
                          </label>

                          <input
                            id={`edit-date-${row.id}`}
                            type="date"
                            value={
                              editing.date
                            }
                            required
                            onChange={event =>
                              setEditing(
                                current => ({
                                  ...current,
                                  date:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                          />
                        </div>

                        <div className="form-field">
                          <label
                            htmlFor={`edit-time-${row.id}`}
                          >
                            Time
                          </label>

                          <input
                            id={`edit-time-${row.id}`}
                            type="time"
                            value={
                              editing.time
                            }
                            required
                            onChange={event =>
                              setEditing(
                                current => ({
                                  ...current,
                                  time:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                          />
                        </div>

                        <div className="form-field">
                          <label
                            htmlFor={`edit-guests-${row.id}`}
                          >
                            Guests
                          </label>

                          <input
                            id={`edit-guests-${row.id}`}
                            type="number"
                            min={
                              tab ===
                              'events'
                                ? 4
                                : 1
                            }
                            max={
                              tab ===
                              'events'
                                ? 100
                                : 12
                            }
                            value={
                              editing.guests
                            }
                            required
                            onChange={event =>
                              setEditing(
                                current => ({
                                  ...current,

                                  guests:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                          />
                        </div>

                        {tab ===
                        'reservations' ? (
                          <div className="form-field">
                            <label
                              htmlFor={`edit-seating-${row.id}`}
                            >
                              Seating
                            </label>

                            <select
                              id={`edit-seating-${row.id}`}
                              value={
                                editing.seating
                              }
                              onChange={event =>
                                setEditing(
                                  current => ({
                                    ...current,

                                    seating:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                            >
                              <option value="Dining Room">
                                Dining
                                Room
                              </option>

                              <option value="Terrace">
                                Terrace
                              </option>
                            </select>
                          </div>
                        ) : (
                          <div className="form-field">
                            <label
                              htmlFor={`edit-type-${row.id}`}
                            >
                              Event type
                            </label>

                            <select
                              id={`edit-type-${row.id}`}
                              value={
                                editing.type
                              }
                              onChange={event =>
                                setEditing(
                                  current => ({
                                    ...current,

                                    type:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                            >
                              <option>
                                Birthday
                                Celebration
                              </option>

                              <option>
                                Corporate
                                Gathering
                              </option>

                              <option>
                                Anniversary
                              </option>

                              <option>
                                Family
                                Celebration
                              </option>

                              <option>
                                Other
                              </option>
                            </select>
                          </div>
                        )}

                        <div
                          style={{
                            display:
                              'flex',
                            gap: 8,
                          }}
                        >
                          <button
                            className="btn btn-primary btn-sm"
                            type="submit"
                            disabled={
                              busyId ===
                              row.id
                            }
                          >
                            Save changes
                          </button>

                          <button
                            className="btn btn-outline btn-sm"
                            type="button"
                            onClick={() =>
                              setEditing(
                                null
                              )
                            }
                          >
                            Close
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p>
                          {row.date} at{' '}
                          {row.time} ·{' '}
                          {row.guests}{' '}
                          guests
                        </p>

                        {row.status !==
                          'Cancelled' && (
                          <div
                            style={{
                              display:
                                'flex',
                              gap: 8,
                            }}
                          >
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() =>
                                beginEdit(
                                  tab,
                                  row
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              disabled={
                                busyId ===
                                row.id
                              }
                              onClick={() =>
                                cancelRecord(
                                  tab,
                                  row
                                )
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="ct-account-empty">
              <h3>
                Nothing saved here yet
              </h3>

              <p>
                This section shows
                records stored by the
                backend while you are
                authenticated.
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