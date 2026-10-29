import { useState } from 'react';
import { CalendarCheck, RefreshCw, Search } from 'lucide-react';
import { getReservations, setReservationStatus } from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import { useToast } from '../../context/ToastContext.jsx';
import { BOOKING_STATUSES, prettyDate, prettyTime } from '../../lib/format.js';
import { ErrorPanel, Spinner, StatusBadge } from '../../components/common/Ui.jsx';

export default function AdminReservations() {
  const { data: rows, loading, error, refresh } = useLiveData(getReservations);
  const [status, setStatus] = useState('All'), [query, setQuery] = useState(''), [busy, setBusy] = useState(null);
  const toast = useToast();
  const filtered = (rows || []).filter(r => (status === 'All' || r.status === status) && `${r.reference} ${r.name} ${r.email}`.toLowerCase().includes(query.toLowerCase()));
  const change = async (id, value) => { setBusy(id); try { await setReservationStatus(id, value); toast('Reservation updated.'); } catch (err) { toast(err.message, 'error'); } finally { setBusy(null); } };
  return <><div className="admin-page-header"><div><span className="eyebrow">RESTAURANT / BOOKINGS</span><h1>Table reservations</h1><p>Review upcoming visits and confirm table requests.</p></div><button type="button" className="btn btn-outline btn-sm" onClick={() => refresh()}><RefreshCw size={16} /> Refresh</button></div><div className="admin-panel admin-list-panel"><div className="admin-filter-row"><div className="admin-search"><Search size={18} /><input aria-label="Search reservations" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search guest or reference..." /></div><select aria-label="Filter reservation status" value={status} onChange={e => setStatus(e.target.value)}>{['All', ...BOOKING_STATUSES].map(s => <option key={s}>{s}</option>)}</select><span className="admin-list-count">{filtered.length} reservations</span></div>
    {error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner /> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Reference / Guest</th><th>Date & time</th><th>Party</th><th>Seating</th><th>Table</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map(r => <tr key={r.id}><td><strong>{r.reference}</strong><small>{r.name} · {r.email}</small>{r.notes && <small className="table-note">{r.notes}</small>}</td><td><strong>{prettyDate(r.date)}</strong><small>{prettyTime(r.time)}</small></td><td>{r.guests} guests</td><td>{r.seating}</td><td>{r.tableId || '—'}</td><td><StatusBadge status={r.status} /></td><td><select className="table-select" aria-label={`Update reservation ${r.reference}`} value={r.status} onChange={e => change(r.id, e.target.value)} disabled={busy === r.id}>{BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{!filtered.length && <div className="admin-empty"><CalendarCheck size={29} /><p>No reservations match your filters.</p></div>}</div>}
  </div><p className="admin-help">Table assignment prevents overlapping requests for the same table within a two-hour window. The dining-room and terrace labels are preferences, not separate seating inventories in this demo.</p></>;
}
