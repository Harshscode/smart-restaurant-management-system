import {
  useEffect,
  useState,
} from 'react';
import {
  RefreshCw,
  Search,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../services/apiClient.js';

// This screen displays real MongoDB users.
// It never reads browser demoAccounts.
export default function AdminUsers() {
  const { sessionUser } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [total, setTotal] = useState(0);

  async function refresh() {
    setLoading(true);
    setError('');

    try {
      const result = await apiRequest(
        '/api/users?page=1&limit=100'
      );

      setAccounts(result.users || []);

      setTotal(
        result.pagination?.total ??
        result.users.length
      );
    } catch (err) {
      setError(
        err.message ||
        'Unable to load user accounts.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function toggleAccess(account) {
    if (account.id === sessionUser?.id) {
      return;
    }

    const nextActive = !account.isActive;
    const verb = nextActive
      ? 'Reactivate'
      : 'Deactivate';

    if (
      !window.confirm(
        `${verb} ${account.email}?`
      )
    ) {
      return;
    }

    setBusyId(account.id);
    setError('');

    try {
      // The backend enforces the admin role
      // and prevents administrators from
      // removing their own access.
      await apiRequest(
        `/api/users/${encodeURIComponent(
          account.id
        )}`,
        {
          method: 'PATCH',
          body: {
            isActive: nextActive,
          },
        }
      );

      await refresh();
    } catch (err) {
      setError(
        err.message ||
        'Unable to update user access.'
      );
    } finally {
      setBusyId(null);
    }
  }

  const filtered = accounts.filter(
    account =>
      (
        roleFilter === 'all' ||
        account.role === roleFilter
      ) &&
      `${account.name} ${account.email}`
        .toLowerCase()
        .includes(
          search.trim().toLowerCase()
        )
  );

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">
            RESTAURANT / USERS
          </span>

          <h1>User management</h1>

          <p>
            View and manage authenticated accounts
            stored in MongoDB.
          </p>
        </div>

        <UsersRound size={30} />
      </div>

      <div className="admin-panel">
        <div className="admin-filter-row">
          <div className="admin-search">
            <Search size={18} />

            <input
              aria-label="Search users"
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
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
            <option value="all">
              All roles
            </option>

            <option value="customer">
              Customers
            </option>

            <option value="admin">
              Administrators
            </option>
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

        {total > accounts.length && (
          <p style={{ padding: 12 }}>
            Displaying the first {accounts.length}{' '}
            users. Additional pages are available
            through the API.
          </p>
        )}

        {error && (
          <p
            className="field-error"
            role="alert"
            style={{ padding: 16 }}
          >
            {error}
          </p>
        )}

        <div style={{ padding: 24 }}>
          {loading ? (
            <p role="status">
              Loading MongoDB users...
            </p>
          ) : filtered.length ? (
            filtered.map(account => (
              <div
                className="ct-admin-row"
                key={account.id}
              >
                <div>
                  <strong>
                    {account.name}
                  </strong>

                  <p>
                    {account.email}

                    {account.phone
                      ? ` · ${account.phone}`
                      : ''}
                  </p>

                  <small>
                    {account.role === 'admin'
                      ? 'Administrator'
                      : 'Customer'}
                    {' · '}
                    {account.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </small>
                </div>

                {account.id ===
                sessionUser?.id ? (
                  <small>Your account</small>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={
                      busyId === account.id
                    }
                    onClick={() =>
                      toggleAccess(account)
                    }
                  >
                    {busyId === account.id
                      ? 'Updating...'
                      : account.isActive
                        ? 'Deactivate'
                        : 'Reactivate'}
                  </button>
                )}
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