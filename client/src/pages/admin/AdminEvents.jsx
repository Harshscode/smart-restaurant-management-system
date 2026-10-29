import { useState } from 'react';
import { PartyPopper, RefreshCw, Search } from 'lucide-react';
import { getEvents, setEventStatus } from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import { useToast } from '../../context/ToastContext.jsx';
import { BOOKING_STATUSES, prettyDate, prettyTime } from '../../lib/format.js';
import { ErrorPanel, Spinner, StatusBadge } from '../../components/common/Ui.jsx';

export default function AdminEvents() {
  const { data: rows, loading, error, refresh } = useLiveData(getEvents);
  const [status, setStatus] = useState('All'), [query, setQuery] = useState(''), [busy, setBusy] = useState(null);
  const toast = useToast();
  const filtered = (rows || []).filter(r => (status === 'All' || r.status === status) && `${r.reference} ${r.name} ${r.type}`.toLowerCase().includes(query.toLowerCase()));
  const change = async (id, value) => { setBusy(id); try { await setEventStatus(id, value); toast('Event enquiry updated.'); } catch (err) { toast(err.message, 'error'); } finally { setBusy(null); } };
  return <><div className="admin-page-header"><div><span className="eyebrow">RESTAURANT / EVENTS</span><h1>Event enquiries</h1><p>Handle birthdays, celebrations, and group gatherings.</p></div><button type="button" className="btn btn-outline btn-sm" onClick={() => refresh()}><RefreshCw size={16} /> Refresh</button></div><div className="admin-panel admin-list-panel"><div className="admin-filter-row"><div className="admin-search"><Search size={18} /><input aria-label="Search event enquiries" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events or guests..." /></div><select aria-label="Filter event status" value={status} onChange={e => setStatus(e.target.value)}>{['All', ...BOOKING_STATUSES].map(s => <option key={s}>{s}</option>)}</select><span className="admin-list-count">{filtered.length} enquiries</span></div>
    {error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner /> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Guest & reference</th><th>Occasion</th><th>Date / time</th><th>Guests</th><th>Preferences</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map(r => <tr key={r.id}><td><strong>{r.name}</strong><small>{r.reference}</small><small>{r.email}</small></td><td>{r.type}</td><td><strong>{prettyDate(r.date)}</strong><small>{prettyTime(r.time)}</small></td><td>{r.guests}</td><td><div className="table-items"><span>{r.menuPreference || '—'}</span>{r.notes && <span>{r.notes}</span>}</div></td><td><StatusBadge status={r.status} /></td><td><select className="table-select" aria-label={`Update event ${r.reference}`} value={r.status} onChange={e => change(r.id, e.target.value)} disabled={busy === r.id}>{BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{!filtered.length && <div className="admin-empty"><PartyPopper size={29} /><p>No event enquiries match your filters.</p></div>}</div>}
  </div><p className="admin-help">Event enquiries are requests only. Confirmed status indicates the team's decision in this demo; no real emails are sent.</p></>;
}
