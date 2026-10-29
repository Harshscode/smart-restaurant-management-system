import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const { isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@copperandthyme.demo');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  if (isAdmin) return <Navigate to="/admin" replace />;
  const submit = e => { e.preventDefault(); if (signIn(email, password)) { navigate('/admin', { replace: true }); } else { setError('Incorrect demo credentials. Please use the details below.'); } };
  return <div className="login-page"><div className="login-visual"><Link to="/" className="login-brand"><Leaf size={20} /> copper<span>&</span>thyme</Link><div><span className="eyebrow eyebrow--light">THE HEART OF OPERATIONS</span><h1>A little order behind <em>every great evening.</em></h1><p>Restaurant management, thoughtfully organized.</p></div><span className="login-visual__bottom">Restaurant administration · frontend demo</span></div><div className="login-form-side"><div className="login-form-wrap"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to restaurant</Link><div className="login-icon"><LockKeyhole size={25} /></div><span className="eyebrow">STAFF ACCESS</span><h2>Welcome back.</h2><p className="login-subtitle">Sign in to manage the restaurant.</p><form onSubmit={submit} className="login-form"><div className="form-field"><label htmlFor="admin-email">Email address</label><input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required /></div><div className="form-field"><label htmlFor="admin-password">Password</label><div className="password-field"><input id="admin-password" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required placeholder="Enter password" /><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(x => !x)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>{error && <p className="field-error" role="alert">{error}</p>}<button className="btn btn-primary btn-block" type="submit">Sign in to dashboard <ArrowRight size={17} /></button></form><div className="demo-credentials"><ShieldCheck size={19} /><div><strong>Frontend demonstration account</strong><p>Email: <code>admin@copperandthyme.demo</code></p><p>Password: <code>Admin123!</code></p><small>This is not secure authentication. Do not use real credentials. Server-side authentication and permissions belong to the later backend phase.</small></div></div></div></div></div>;
}
