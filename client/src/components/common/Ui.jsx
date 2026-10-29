import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, LoaderCircle, UtensilsCrossed } from 'lucide-react';

export function SectionHeading({ eyebrow, title, description, center = false, action }) {
  return <div className={`section-heading ${center ? 'text-center' : ''}`}>
    <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action && <Link to={action.to} className="text-link">{action.label}<ArrowRight size={17} /></Link>}
  </div>;
}

export function PageHeader({ eyebrow, title, description }) {
  return <section className="page-header"><div className="container"><span className="eyebrow eyebrow--light">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div></section>;
}

export function Field({ label, name, error, required = false, hint, children }) {
  return <div className="form-field">
    <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {children}
    {hint && <small className="field-hint">{hint}</small>}
    {error && <small className="field-error" role="alert"><AlertCircle size={13} />{error}</small>}
  </div>;
}

export function EmptyState({ icon: Icon = UtensilsCrossed, title, description, action }) {
  return <div className="empty-state"><span className="empty-state__icon"><Icon size={30} strokeWidth={1.5} /></span><h3>{title}</h3><p>{description}</p>{action && <Link className="btn btn-primary" to={action.to}>{action.label}<ArrowRight size={16} /></Link>}</div>;
}

export function Spinner({ label = 'Loading' }) {
  return <div className="loading" role="status"><LoaderCircle className="spin" size={27} /><span>{label}...</span></div>;
}

export function ErrorPanel({ message, refresh }) {
  return <div className="error-panel" role="alert"><AlertCircle size={22} /><div><strong>We couldn't load that information.</strong><p>{message}</p></div>{refresh && <button type="button" className="btn btn-outline btn-sm" onClick={() => refresh()}>Retry</button>}</div>;
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${String(status || '').toLowerCase()}`}>{status}</span>;
}

export function FoodImage({ src, alt, className = '' }) {
  return <div className={`food-image ${className}`}><span className="food-image__fallback"><UtensilsCrossed size={34} strokeWidth={1.2} /></span>
    {src && <img src={src} alt={alt} loading="lazy" onError={(event) => { event.currentTarget.style.opacity = '0'; }} />}
  </div>;
}

export function SummaryLine({ label, value, strong = false }) {
  return <div className={`summary-line ${strong ? 'summary-line--strong' : ''}`}><span>{label}</span><span>{value}</span></div>;
}

export function SuccessCard({ eyebrow = 'Request received', title, description, reference, link }) {
  return <div className="success-card"><span className="success-card__icon">✓</span><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p>{reference && <div className="reference-box"><small>Your reference</small><strong>{reference}</strong></div>}
    <div className="success-card__actions"><Link to={link?.to || '/'} className="btn btn-primary">{link?.label || 'Back to home'}<ArrowRight size={17} /></Link><Link className="btn btn-outline" to="/menu">Explore menu</Link></div>
  </div>;
}
