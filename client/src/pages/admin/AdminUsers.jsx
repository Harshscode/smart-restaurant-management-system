import { useEffect, useState } from 'react';
import {
  Pencil,
  Plus,
  RefreshCw,
  Search,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../services/apiClient.js';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer',
  isActive: true,
};

export default function AdminUsers() {
  const { sessionUser } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(null);

  async function refresh() {
    setLoading(true);
    setError('');

    try {
      const result = await apiRequest(
        '/api/users?page=1&limit=100',
      );

      const users = [...(result.users || [])];

      for (
        let page = 2;
        page <= (result.pagination?.pages || 1);
        page += 1
      ) {
        const next = await apiRequest(
          `/api/users?page=${page}&limit=100`,
        );

        users.push(...(next.users || []));
      }

      setAccounts(users);
      setTotal(result.pagination?.total ?? users.length);
    } catch (err) {
      setError(err.message || 'Unable to load user accounts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function startEdit(account) {
    setForm({
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone || '',
      role: account.role,
      isActive: account.isActive,
    });

    setError('');
    setNotice('');
  }

  async function saveUser(event) {
    event.preventDefault();

    setBusyId(form.id || 'new');
    setError('');
    setNotice('');

    try {
      const isNew = !form.id;

      const body = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role,
        ...(isNew
          ? { password: form.password }
          : { isActive: form.isActive }),
      };

      await apiRequest(
        isNew
          ? '/api/users'
          : `/api/users/${encodeURIComponent(form.id)}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          body,
        },
      );

      setNotice(
        isNew
          ? 'User account created in MongoDB.'
          : 'User account updated in MongoDB.',
      );

      setForm(null);
      await refresh();
    } catch (err) {
      setError(
        err.message || 'Unable to save the user account.',
      );
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAccess(account) {
    if (account.id === sessionUser?.id) return;

    const nextActive = !account.isActive;
    const verb = nextActive ? 'Reactivate' : 'Deactivate';

    if (!window.confirm(`${verb} ${account.email}?`)) {
      return;
    }

    setBusyId(account.id);
    setError('');
    setNotice('');

    try {
      await apiRequest(
        `/api/users/${encodeURIComponent(account.id)}`,
        {
          method: 'PATCH',
          body: {
            isActive: nextActive,
          },
        },
      );

      setNotice(
        `${account.email} was ${
          nextActive ? 'reactivated' : 'deactivated'
        }.`,
      );

      await refresh();
    } catch (err) {
      setError(err.message || 'Unable to update user access.');
    } finally {
      setBusyId(null);
    }
  }

  const filtered = accounts.filter(
    account =>
      (roleFilter === 'all' || account.role === roleFilter) &&
      `${account.name} ${account.email}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">RESTAURANT / USERS</span>
          <h1>User management</h1>

          <p>
            Create, view, edit, deactivate and reactivate MongoDB
            accounts.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setForm({ ...emptyForm })}
          >
            <Plus size={15} />
            Add user
          </button>

          <UsersRound size={30} />
        </div>
      </div>

      {form && (
        <form
          className="admin-panel booking-form"
          onSubmit={saveUser}
          style={{
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div className="admin-panel__header">
            <div>
              <h2>{form.id ? 'Edit user' : 'Create user'}</h2>

              <p>
                {form.id
                  ? 'Update account details and access.'
                  : 'Create a secure customer or administrator account.'}
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="admin-user-name">
                Full name
              </label>

              <input
                id="admin-user-name"
                value={form.name}
                minLength="2"
                maxLength="80"
                required
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="admin-user-email">
                Email
              </label>

              <input
                id="admin-user-email"
                type="email"
                value={form.email}
                required
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="admin-user-phone">
                Phone
              </label>

              <input
                id="admin-user-phone"
                type="tel"
                value={form.phone}
                maxLength="25"
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="admin-user-role">
                Role
              </label>

              <select
                id="admin-user-role"
                value={form.role}
                disabled={form.id === sessionUser?.id}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
              >
                <option value="customer">Customer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {!form.id && (
              <div className="form-field">
                <label htmlFor="admin-user-password">
                  Temporary password
                </label>

                <input
                  id="admin-user-password"
                  type="password"
                  value={form.password}
                  minLength="12"
                  required
                  autoComplete="new-password"
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />

                <small>At least 12 characters.</small>
              </div>
            )}

            {form.id && form.id !== sessionUser?.id && (
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Account is active
              </label>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busyId === (form.id || 'new')}
            >
              {busyId ? 'Saving...' : 'Save user'}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setForm(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-panel">
        <div className="admin-filter-row">
          <div className="admin-search">
            <Search size={18} />

            <input
              aria-label="Search users"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name or email"
            />
          </div>

          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={event =>
              setRoleFilter(event.target.value)
            }
          >
            <option value="all">All roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <span className="admin-list-count">
            {total} database users
          </span>
        </div>

        {error && (
          <p
            className="field-error"
            role="alert"
            style={{ padding: 16 }}
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            className="ct-demo-note"
            role="status"
            style={{ margin: 16 }}
          >
            {notice}
          </p>
        )}

        <div style={{ padding: 24 }}>
          {loading ? (
            <p role="status">Loading MongoDB users...</p>
          ) : filtered.length ? (
            filtered.map(account => (
              <div
                className="ct-admin-row"
                key={account.id}
              >
                <div>
                  <strong>{account.name}</strong>

                  <p>
                    {account.email}
                    {account.phone
                      ? ` · ${account.phone}`
                      : ''}
                  </p>

                  <small>
                    {account.role === 'admin'
                      ? 'Administrator'
                      : 'Customer'}{' '}
                    · {account.isActive ? 'Active' : 'Inactive'}
                  </small>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => startEdit(account)}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  {account.id === sessionUser?.id ? (
                    <small>Your account</small>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={busyId === account.id}
                      onClick={() => toggleAccess(account)}
                    >
                      {busyId === account.id
                        ? 'Updating...'
                        : account.isActive
                          ? 'Deactivate'
                          : 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No matching users found.</p>
          )}
        </div>
      </div>
    </>
  );
}