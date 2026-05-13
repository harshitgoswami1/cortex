import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Grab the current session once on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    // Keep in sync with any auth state changes (e.g. token refresh, sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []); // ← empty dep array: run once, never loop

  return (
    <div>
      {/* ProtectedRoute guarantees user is logged in here, so no "Sign in" button needed */}
      <p>Welcome, {user?.user_metadata?.full_name ?? user?.email}</p>
    </div>
  );
}