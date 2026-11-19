import { useState } from 'react';
import {
  CalendarCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  getReservations,
  setReservationStatus,
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

const reservationStatusOptions = status =>
  status === 'Pending'
    ? ['Pending', 'Confirmed', 'Cancelled']
    : status === 'Confirmed'
      ? ['Confirmed', 'Cancelled']
      : ['Cancelled'];

export default function AdminReservations() {
  const {
    data: rows,
    loading,
    error,
    refresh,
  } = useLiveData(getReservations);

  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(null);

  const toast = useToast();

  const filtered = (rows || []).filter(
    reservation =>
      (status === 'All' || reservation.status === status) &&
      `${reservation.reference} ${reservation.name} ${reservation.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const change = async (id, value) => {
    setBusy(id);

    try {
      await setReservationStatus(id, value);
      await refresh(true);
      toast('Reservation updated in MongoDB.');
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
          <span className="eyebrow">RESTAURANT / BOOKINGS</span>
          <h1>Table reservations</h1>
          <p>Review upcoming visits and confirm table requests.</p>
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
              aria-label="Search reservations"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search guest or reference..."
            />
          </div>

          <select
            aria-label="Filter reservation status"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {['All', ...BOOKING_STATUSES].map(value => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <span className="admin-list-count">
            {filtered.length} reservations
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
                  <th>Reference / Guest</th>
                  <th>Date &amp; time</th>
                  <th>Party</th>
                  <th>Seating</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(reservation => (
                  <tr key={reservation.id}>
                    <td>
                      <strong>{reservation.reference}</strong>

                      <small>
                        {reservation.name} · {reservation.email}
                      </small>

                      {reservation.notes && (
                        <small className="table-note">
                          {reservation.notes}
                        </small>
                      )}
                    </td>

                    <td>
                      <strong>
                        {prettyDate(reservation.date)}
                      </strong>
                      <small>{prettyTime(reservation.time)}</small>
                    </td>

                    <td>{reservation.guests} guests</td>
                    <td>{reservation.seating}</td>
                    <td>{reservation.tableId || '—'}</td>

                    <td>
                      <StatusBadge status={reservation.status} />
                    </td>

                    <td>
                      <select
                        className="table-select"
                        aria-label={`Update reservation ${reservation.reference}`}
                        value={reservation.status}
                        onChange={e =>
                          change(reservation.id, e.target.value)
                        }
                        disabled={
                          busy === reservation.id ||
                          reservation.status === 'Cancelled'
                        }
                      >
                        {reservationStatusOptions(
                          reservation.status,
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
                <CalendarCheck size={29} />
                <p>No reservations match your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="admin-help">
        MongoDB table schedules prevent overlapping requests for the same
        table within a two-hour window. Dining Room and Terrace are seating
        preferences.
      </p>
    </>
  );
}