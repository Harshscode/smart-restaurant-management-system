
import { useState } from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { isAdmin, checkingSession, signIn } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await signIn(email, password);

      navigate("/admin", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="container section" role="status">
        Checking administrator session...
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <Link to="/" className="login-brand">
          <Leaf size={20} />
          copper<span>&</span>thyme
        </Link>

        <div>
          <span className="eyebrow eyebrow--light">
            THE HEART OF OPERATIONS
          </span>

          <h1>
            A little order behind{" "}
            <em>every great evening.</em>
          </h1>

          <p>
            Restaurant management, thoughtfully organized.
          </p>
        </div>

        <span className="login-visual__bottom">
          Restaurant administration
        </span>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrap">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to restaurant
          </Link>

          <div className="login-icon">
            <LockKeyhole size={25} />
          </div>

          <span className="eyebrow">
            STAFF ACCESS
          </span>

          <h2>Welcome back.</h2>

          <p className="login-subtitle">
            Sign in to manage the restaurant.
          </p>

          <form
            onSubmit={submit}
            className="login-form"
          >
            <div className="form-field">
              <label htmlFor="admin-email">
                Email address
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                autoComplete="username"
                placeholder="Enter administrator email"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="admin-password">
                Password
              </label>

              <div className="password-field">
                <input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  required
                  disabled={submitting}
                />

                <button
                  type="button"
                  aria-label={
                    show ? "Hide password" : "Show password"
                  }
                  onClick={() => setShow((value) => !value)}
                >
                  {show ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
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
              className="btn btn-primary btn-block"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Signing in..."
                : "Sign in to dashboard"}

              {!submitting && (
                <ArrowRight size={17} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
