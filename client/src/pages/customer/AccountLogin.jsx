import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/common/Ui.jsx';

export default function AccountLogin() {
  const { user, startCustomerPreview } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  if (user) return <Navigate to="/account" replace />;
  function submit(event) {
    event.preventDefault();
    try {
      startCustomerPreview(form);
      navigate('/account', { replace: true });
    } catch (err) { setError(err.message); }
  }
  return <>
    <PageHeader eyebrow="CUSTOMER ACCOUNT PREVIEW" title={<>Your restaurant, <em>your way.</em></>} description="See a frontend-only preview of order history and bookings tied to a sample email address." />
    <section className="section"><div className="container ct-account-content">
      <div className="ct-demo-note"><strong>Frontend demonstration only:</strong> This is not secure login. Use sample details only. No password is requested, verified, or stored. The later backend will provide real accounts and authentication.</div>
      <form className="booking-form" onSubmit={submit} style={{ maxWidth: 650, margin: '0 auto' }}>
        <div className="login-icon"><UserRound size={24} /></div><h2>Open a demo account</h2>
        <p className="form-intro">Use the same email as your test order or reservation to view it here.</p>
        <div className="form-field"><label htmlFor="demo-name">Name</label><input id="demo-name" required minLength={2} maxLength={120} value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} autoComplete="name" /></div>
        <div className="form-field"><label htmlFor="demo-email">Email</label><input id="demo-email" type="email" required value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} autoComplete="email" /></div>
        <div className="form-field"><label htmlFor="demo-phone">Phone (optional)</label><input id="demo-phone" type="tel" value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} autoComplete="tel" /></div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit">View demo profile <ArrowRight size={16} /></button>
        <p><Link to="/menu" className="text-link">Continue as a guest</Link></p>
      </form>
    </div></section>
  </>;
}
