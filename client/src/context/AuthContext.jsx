
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { readStored, writeStored } from "../lib/storage.js";

const AuthContext = createContext(null);

// Temporary customer preview storage.
// This will be replaced during customer API integration.
const CUSTOMER_SESSION = "ct_srms_customer_preview_session";

const WRITE_HEADERS = {
  "Content-Type": "application/json",
  "X-SRMS-Request": "1",
};

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Temporary frontend customer preview.
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(CUSTOMER_SESSION) || "null"
      );
    } catch {
      return null;
    }
  });

  // Restore the real administrator session on page refresh.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          if (active) setIsAdmin(false);
          return;
        }

        const data = await response.json();

        if (active) {
          setIsAdmin(data?.user?.role === "admin");
        }
      } catch (error) {
        console.error("Session verification failed:", error);

        if (active) {
          setIsAdmin(false);
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
      isAdmin,
      user,
      checkingSession,

      // Real MongoDB administrator authentication.
      signIn: async (email, password) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: WRITE_HEADERS,
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to log in."
          );
        }

        // The admin portal must reject customer accounts.
        if (data.user?.role !== "admin") {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: {
              "X-SRMS-Request": "1",
            },
          });

          throw new Error(
            "Administrator access is required."
          );
        }

        setIsAdmin(true);
        return true;
      },

      // Temporary customer preview.
      startCustomerPreview: (details) => {
        const email = String(details.email || "")
          .trim()
          .toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Enter a valid email address.");
        }

        const saved = readStored("demoAccounts", []);
        const accounts = Array.isArray(saved) ? saved : [];

        const known = accounts.find(
          (account) => account.email === email
        );

        const name = String(
          details.name || known?.name || ""
        ).trim();

        if (name.length < 2) {
          throw new Error(
            "Name must contain at least two characters."
          );
        }

        const profile = {
          id: known?.id || `demo-${Date.now()}`,
          name,
          email,
          phone: String(
            details.phone || known?.phone || ""
          ).trim(),
        };

        const updatedAccounts = known
          ? accounts.map((account) =>
              account.email === email ? profile : account
            )
          : [...accounts, profile];

        writeStored("demoAccounts", updatedAccounts);

        sessionStorage.setItem(
          CUSTOMER_SESSION,
          JSON.stringify(profile)
        );

        setUser(profile);
        return profile;
      },

      // Temporary customer preview update.
      saveProfile: (details) => {
        if (!user) {
          throw new Error("No customer profile is open.");
        }

        const profile = {
          ...user,
          name: String(details.name || "").trim(),
          phone: String(details.phone || "").trim(),
        };

        if (profile.name.length < 2) {
          throw new Error(
            "Name must contain at least two characters."
          );
        }

        const saved = readStored("demoAccounts", []);
        const accounts = Array.isArray(saved) ? saved : [];

        writeStored(
          "demoAccounts",
          accounts.map((account) =>
            account.email === user.email
              ? profile
              : account
          )
        );

        sessionStorage.setItem(
          CUSTOMER_SESSION,
          JSON.stringify(profile)
        );

        setUser(profile);
        return profile;
      },

      // Real server logout.
      signOut: async () => {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "X-SRMS-Request": "1",
          },
        });

        if (!response.ok) {
          throw new Error("Unable to sign out.");
        }

        setIsAdmin(false);
        setUser(null);

        sessionStorage.removeItem(CUSTOMER_SESSION);
      },
    }),
    [isAdmin, user, checkingSession]
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
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
