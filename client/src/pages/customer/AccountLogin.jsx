import { useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/common/Ui.jsx';

export default function AccountLogin() {
  const {
    user,
    isAdmin,
    checkingSession,
    loginCustomer,
    registerCustomer,
  } = useAuth();

  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] =
    useState(false);

  function update(event) {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

    setError('');
  }

  async function submit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (mode === 'register') {
        await registerCustomer(form);
      } else {
        await loginCustomer(
          form.email,
          form.password
        );
      }

      navigate('/account', {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || 'Unable to authenticate.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <div
        className="container section"
        role="status"
      >
        Checking your session...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/account" replace />;
  }

  if (isAdmin) {
    return (
      <section className="container section">
        <h1>Staff session active</h1>

        <p>
          You are currently signed in as an
          administrator. Sign out from the staff portal
          before signing in as a customer in this browser.
        </p>

        <Link
          className="btn btn-primary"
          to="/admin"
        >
          Go to staff portal
        </Link>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="CUSTOMER ACCOUNT"
        title={
          <>
            Your restaurant, <em>your way.</em>
          </>
        }
        description="Sign in or create an account to see your own orders and reservations."
      />

      <section className="section">
        <div className="container ct-account-content">
          <form
            className="booking-form"
            onSubmit={submit}
            style={{
              maxWidth: 650,
              margin: '0 auto',
            }}
          >
            <div className="login-icon">
              <UserRound size={24} />
            </div>

            <h2>
              {mode === 'login'
                ? 'Welcome back'
                : 'Create your account'}
            </h2>

            <p className="form-intro">
              {mode === 'login'
                ? 'Enter your registered email and password.'
                : 'Your account will be securely created in the restaurant database.'}
            </p>

            <div
              className="ct-account-tabs"
              role="group"
              aria-label="Account access options"
              style={{ marginBottom: 20 }}
            >
              <button
                type="button"
                className={
                  mode === 'login' ? 'active' : ''
                }
                aria-pressed={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                disabled={submitting}
              >
                Sign in
              </button>

              <button
                type="button"
                className={
                  mode === 'register' ? 'active' : ''
                }
                aria-pressed={mode === 'register'}
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                disabled={submitting}
              >
                Register
              </button>
            </div>

            {mode === 'register' && (
              <>
                <div className="form-field">
                  <label htmlFor="customer-name">
                    Full name
                  </label>

                  <input
                    id="customer-name"
                    name="name"
                    value={form.name}
                    onChange={update}
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    disabled={submitting}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="customer-phone">
                    Phone (optional)
                  </label>

                  <input
                    id="customer-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={update}
                    maxLength={25}
                    autoComplete="tel"
                    disabled={submitting}
                  />
                </div>
              </>
            )}

            <div className="form-field">
              <label htmlFor="customer-email">
                Email address
              </label>

              <input
                id="customer-email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                required
                maxLength={254}
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="customer-password">
                Password
              </label>

              <div className="password-field">
                <input
                  id="customer-password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={form.password}
                  onChange={update}
                  required
                  minLength={
                    mode === 'register' ? 12 : 1
                  }
                  autoComplete={
                    mode === 'register'
                      ? 'new-password'
                      : 'current-password'
                  }
                  disabled={submitting}
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  onClick={() =>
                    setShowPassword(value => !value)
                  }
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>

              {mode === 'register' && (
                <small>
                  Use a password with at least 12
                  characters.
                </small>
              )}
            </div>

            {error && (
              <p
                className="field-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}

              {!submitting && (
                <ArrowRight size={16} />
              )}
            </button>

            <p>
              <Link
                to="/menu"
                className="text-link"
              >
                Continue as a guest
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}