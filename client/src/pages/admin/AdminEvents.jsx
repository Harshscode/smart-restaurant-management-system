import { useState } from 'react';
import {
  PartyPopper,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  getEvents,
  setEventStatus,
} from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  BOOKING_STATUSES,
  prettyDate,
  prettyTime,
} from '../../lib/format.js';
import {
  ErrorPanel,
  Spinner,
  StatusBadge,
} from '../../components/common/Ui.jsx';

const eventStatusOptions = status =>
  status === 'Pending'
    ? ['Pending', 'Confirmed', 'Cancelled']
    : status === 'Confirmed'
      ? ['Confirmed', 'Cancelled']
      : ['Cancelled'];

export default function AdminEvents() {
  const {
    data: rows,
    loading,
    error,
    refresh,
  } = useLiveData(getEvents);

  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(null);

  const toast = useToast();

  const filtered = (rows || []).filter(
    event =>
      (status === 'All' || event.status === status) &&
      `${event.reference} ${event.name} ${event.type}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const change = async (id, value) => {
    setBusy(id);

    try {
      await setEventStatus(id, value);
      await refresh(true);
      toast('Event enquiry updated in MongoDB.');
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
          <span className="eyebrow">RESTAURANT / EVENTS</span>
          <h1>Event enquiries</h1>
          <p>Handle birthdays, celebrations, and group gatherings.</p>
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
              aria-label="Search event enquiries"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search events or guests..."
            />
          </div>

          <select
            aria-label="Filter event status"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {['All', ...BOOKING_STATUSES].map(value => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <span className="admin-list-count">
            {filtered.length} enquiries
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
                  <th>Guest &amp; reference</th>
                  <th>Occasion</th>
                  <th>Date / time</th>
                  <th>Guests</th>
                  <th>Preferences</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(event => (
                  <tr key={event.id}>
                    <td>
                      <strong>{event.name}</strong>
                      <small>{event.reference}</small>
                      <small>{event.email}</small>
                    </td>

                    <td>{event.type}</td>

                    <td>
                      <strong>{prettyDate(event.date)}</strong>
                      <small>{prettyTime(event.time)}</small>
                    </td>

                    <td>{event.guests}</td>

                    <td>
                      <div className="table-items">
                        <span>{event.menuPreference || '—'}</span>

                        {event.notes && (
                          <span>{event.notes}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={event.status} />
                    </td>

                    <td>
                      <select
                        className="table-select"
                        aria-label={`Update event ${event.reference}`}
                        value={event.status}
                        onChange={e =>
                          change(event.id, e.target.value)
                        }
                        disabled={
                          busy === event.id ||
                          event.status === 'Cancelled'
                        }
                      >
                        {eventStatusOptions(event.status).map(
                          value => (
                            <option key={value}>{value}</option>
                          ),
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filtered.length && (
              <div className="admin-empty">
                <PartyPopper size={29} />
                <p>No event enquiries match your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="admin-help">
        Event enquiries are stored in MongoDB. Confirmed status records the
        team's decision; this application does not send email or SMS
        notifications.
      </p>
    </>
  );
}