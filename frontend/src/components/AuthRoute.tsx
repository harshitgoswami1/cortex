import { Navigate } from "react-router";
import { useAuth } from "../context/AuthProvider";

/**
 * Wraps public-only routes (e.g. /auth).
 * - undefined session → still loading, render nothing
 * - valid session     → already logged in, redirect to dashboard
 * - null session      → not logged in, render children
 */
export default function AuthRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  if (session === undefined) return null; // loading
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

