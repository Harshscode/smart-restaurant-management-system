import { useState } from 'react';
import { CalendarDays, Clock3, Users, ArrowRight } from 'lucide-react';
import { Field, PageHeader, SuccessCard } from '../../components/common/Ui.jsx';
import { reserveTable } from '../../services/restaurantService.js';
import { minimumBookingDate, validateReservation, hasErrors } from '../../lib/validation.js';
import { addDays } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const times = Array.from({ length: 19 }, (_, i) => {
  const total = 12 * 60 + i * 30;
  const h = Math.floor(total / 60), m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});
const empty = { name: '', email: '', phone: '', date: addDays(1), time: '19:00', guests: '2', seating: 'Dining Room', notes: '' };

export default function Reservations() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const update = e => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setErrors(prev => ({ ...prev, [e.target.name]: undefined, date: undefined })); };
  const submit = async (e) => {
    e.preventDefault(); const errors = validateReservation(form); setErrors(errors);
    if (hasErrors(errors)) return;
    setSaving(true);
    try { setResult(await reserveTable(form)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (err) { setErrors(err.fields || {}); toast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  return <><PageHeader eyebrow="A PLACE AT OUR TABLE" title={<>Good evenings <em>start here.</em></>} description="Some nights deserve a table worth sitting around. Save yours in just a moment." />
    <section className="section booking-page"><div className="container booking-layout"><div className="booking-intro"><span className="eyebrow">MAKE IT A DATE</span><h2>Your table <em>awaits.</em></h2><p>From a spontaneous date night to a dinner with your favorite people, we'd love to have you.</p><div className="booking-benefit"><CalendarDays size={23} /><div><strong>Easy reservations</strong><span>Choose a date and preferred time.</span></div></div><div className="booking-benefit"><Users size={23} /><div><strong>Room for everyone</strong><span>Tables for parties of 1–12.</span></div></div><div className="booking-benefit"><Clock3 size={23} /><div><strong>Lunch or dinner</strong><span>Daily reservations from 12 PM to 9 PM.</span></div></div><div className="booking-intro__photo" role="img" aria-label="Elegant dining table set for dinner" /></div>
      {result ? <SuccessCard eyebrow="YOUR BOOKING REQUEST" title="We saved your request!" description={`Thank you, ${result.name}. Your reservation for ${result.guests} guest${result.guests === 1 ? '' : 's'} is pending confirmation. This frontend demo stores the request in your browser; no real reservation has been made.`} reference={result.reference} /> : <form className="booking-form" onSubmit={submit} noValidate><div className="form-step">LET'S PLAN YOUR VISIT</div><h2>Reservation details</h2><p className="form-intro">Share a few details and we'll take care of the rest.</p><div className="form-grid"><Field label="Date" name="date" required error={errors.date}><input id="date" name="date" type="date" min={minimumBookingDate()} value={form.date} onChange={update} /></Field><Field label="Time" name="time" required error={errors.time}><select id="time" name="time" value={form.time} onChange={update}>{times.map(time => <option key={time} value={time}>{new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</option>)}</select></Field><Field label="Number of guests" name="guests" required error={errors.guests}><select id="guests" name="guests" value={form.guests} onChange={update}>{Array.from({ length: 12 }, (_, i) => <option value={i + 1} key={i}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>)}</select></Field><Field label="Seating preference" name="seating"><select id="seating" name="seating" value={form.seating} onChange={update}><option>Dining Room</option><option>Terrace</option></select></Field><Field label="Full name" name="name" required error={errors.name}><input id="name" name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={update} /></Field><Field label="Email" name="email" required error={errors.email}><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} /></Field><Field label="Phone number" name="phone" required error={errors.phone}><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" value={form.phone} onChange={update} /></Field></div><Field label="Anything we should know? (optional)" name="notes"><textarea id="notes" name="notes" rows={3} maxLength={500} value={form.notes} onChange={update} placeholder="Special occasion, accessibility needs, or seating requests" /></Field><button className="btn btn-primary btn-block" disabled={saving} type="submit">{saving ? 'Requesting your table...' : 'Request a reservation'}<ArrowRight size={17} /></button><small className="form-disclaimer">Requests are saved locally in the frontend demo and require administrator confirmation. No actual restaurant reservation is made.</small></form>}
    </div></section>
  </>;
}
