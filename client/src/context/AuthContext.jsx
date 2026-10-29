import { createContext, useContext, useMemo, useState } from 'react';
import { readStored, writeStored } from '../lib/storage.js';

const AuthContext = createContext(null);
const ADMIN_SESSION = 'ct_srms_admin_demo_session';
const CUSTOMER_SESSION = 'ct_srms_customer_preview_session';

// This is deliberately a NON-SECURE frontend demonstration.
// Customer profiles contain no stored passwords. Real authentication and
// authorization are added with the Node/Express backend in the later phase.
export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(ADMIN_SESSION) === 'true');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION) || 'null'); }
    catch { return null; }
  });

  const value = useMemo(() => ({
    isAdmin,
    user,
    checkingSession: false,
    signIn: (email, password) => {
      const accepted = email?.trim().toLowerCase() === 'admin@copperandthyme.demo' && password === 'Admin123!';
      if (accepted) {
        sessionStorage.setItem(ADMIN_SESSION, 'true');
        setIsAdmin(true);
      }
      return accepted;
    },
    startCustomerPreview: (details) => {
      const email = String(details.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid demo email address.');
      const accounts = readStored('demoAccounts', []);
      const known = accounts.find(account => account.email === email);
      const name = String(details.name || known?.name || '').trim();
      if (name.length < 2) throw new Error('Enter a name with at least two characters.');
      const profile = { id: known?.id || `demo-${Date.now()}`, name, email, phone: String(details.phone || known?.phone || '').trim() };
      writeStored('demoAccounts', known ? accounts.map(a => a.email === email ? profile : a) : [...accounts, profile]);
      sessionStorage.setItem(CUSTOMER_SESSION, JSON.stringify(profile));
      setUser(profile);
      return profile;
    },
    saveProfile: (details) => {
      if (!user) throw new Error('Open a demo profile first.');
      const profile = { ...user, name: String(details.name || '').trim(), phone: String(details.phone || '').trim() };
      if (profile.name.length < 2) throw new Error('Name must be at least two characters.');
      writeStored('demoAccounts', readStored('demoAccounts', []).map(a => a.email === user.email ? profile : a));
      sessionStorage.setItem(CUSTOMER_SESSION, JSON.stringify(profile));
      setUser(profile);
      return profile;
    },
    signOut: () => {
      sessionStorage.removeItem(ADMIN_SESSION);
      sessionStorage.removeItem(CUSTOMER_SESSION);
      setIsAdmin(false);
      setUser(null);
    },
  }), [isAdmin, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
