import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "../lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

const supabase = createClient();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

type AuthContextType = {
  session: Session | null | undefined; // undefined = still initialising
};

const AuthContext = createContext<AuthContextType>({ session: undefined });

/**
 * Syncs the Supabase auth user → app database (Prisma).
 * Called automatically on every SIGNED_IN event so it works regardless of
 * which route the user lands on after OAuth redirect.
 */
async function syncUserToBackend(accessToken: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[AuthProvider] sync-user failed:", body);
    } else {
      const body = await res.json();
      console.log("[AuthProvider] User synced:", body);
    }
  } catch (err) {
    console.error("[AuthProvider] sync-user network error:", err);
  }
}

/**
 * Wraps the whole app. Uses onAuthStateChange so the INITIAL_SESSION event
 * fires immediately from the localStorage cache — no network round-trip needed
 * to decide the initial auth state. Both ProtectedRoute and AuthRoute read
 * from this single source of truth, eliminating the redirect loop.
 *
 * Also handles the 2-way sync: whenever a SIGNED_IN event fires, we POST the
 * JWT to /sync-user so the backend upserts the user into the Prisma DB.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const syncedForUser = useRef<string | null>(null); // avoid duplicate syncs

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Sync on SIGNED_IN (first login) and TOKEN_REFRESHED (returning user).
      // We guard with syncedForUser so we don't fire multiple times for the
      // same user within a single page lifecycle.
      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        session?.user &&
        syncedForUser.current !== session.user.id
      ) {
        syncedForUser.current = session.user.id;
        syncUserToBackend(session.access_token);
      }

      // Reset on sign-out so a re-login triggers a fresh sync.
      if (event === "SIGNED_OUT") {
        syncedForUser.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
