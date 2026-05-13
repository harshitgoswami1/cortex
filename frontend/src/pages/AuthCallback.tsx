import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

/**
 * AuthCallback
 *
 * Supabase redirects here after OAuth completes and writes the session tokens
 * into localStorage via the URL hash fragment.
 *
 * The actual /sync-user call is handled by AuthProvider's onAuthStateChange
 * listener (which fires SIGNED_IN as soon as the session is stored). This
 * component just waits a tick for that to happen, then navigates to "/".
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    // Give onAuthStateChange a moment to fire and trigger the sync,
    // then navigate to the dashboard.
    const timer = setTimeout(() => navigate("/", { replace: true }), 300);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        fontSize: "1.1rem",
        color: "#555",
      }}
    >
      Signing you in…
    </div>
  );
}
