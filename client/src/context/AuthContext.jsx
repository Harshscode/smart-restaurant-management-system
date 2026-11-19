import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiRequest } from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The HttpOnly cookie is the authentication source of truth.
  // A backend session can represent either an admin or a customer.
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const result = await apiRequest('/api/auth/me');

        if (active) {
          setSessionUser(result.user ?? null);
        }
      } catch {
        if (active) {
          setSessionUser(null);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      sessionUser,
      isAdmin: sessionUser?.role === 'admin',
      user:
        sessionUser?.role === 'customer'
          ? sessionUser
          : null,
      checkingSession,

      // AdminLogin.jsx uses this method.
      signIn: async (email, password) => {
        const result = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: {
            email: email.trim().toLowerCase(),
            password,
          },
        });

        if (result.user?.role !== 'admin') {
          // Login may have set a customer cookie.
          // Remove it before rejecting access to the admin portal.
          await apiRequest('/api/auth/logout', {
            method: 'POST',
          });

          setSessionUser(null);

          throw new Error(
            'Administrator access is required. Use the customer login for customer accounts.'
          );
        }

        setSessionUser(result.user);
        return true;
      },

      loginCustomer: async (email, password) => {
        const result = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: {
            email: email.trim().toLowerCase(),
            password,
          },
        });

        if (result.user?.role !== 'customer') {
          await apiRequest('/api/auth/logout', {
            method: 'POST',
          });

          setSessionUser(null);

          throw new Error(
            'This is a staff account. Please use the staff portal.'
          );
        }

        setSessionUser(result.user);
        return result.user;
      },

      registerCustomer: async ({
        name,
        email,
        password,
        phone = '',
      }) => {
        const result = await apiRequest(
          '/api/auth/register',
          {
            method: 'POST',
            body: {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              phone: phone.trim(),
            },
          }
        );

        if (result.user?.role !== 'customer') {
          throw new Error(
            'Unexpected role returned during registration.'
          );
        }

        setSessionUser(result.user);
        return result.user;
      },

      refreshProfile: async () => {
        const result = await apiRequest('/api/users/me');

        setSessionUser(result.user);
        return result.user;
      },

      saveProfile: async ({ name, phone }) => {
        if (sessionUser?.role !== 'customer') {
          throw new Error('Customer login is required.');
        }

        const result = await apiRequest('/api/users/me', {
          method: 'PATCH',
          body: {
            name: name.trim(),
            phone: phone.trim(),
          },
        });

        setSessionUser(result.user);
        return result.user;
      },

      signOut: async () => {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
        });

        setSessionUser(null);
      },
    }),
    [sessionUser, checkingSession]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.'
    );
  }

  return context;
}