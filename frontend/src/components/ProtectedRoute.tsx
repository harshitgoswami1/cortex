import { Navigate } from "react-router";
import { useAuth } from "../context/AuthProvider";

/**
 * Wraps a route that requires authentication.
 * - undefined session → still loading, render nothing
 * - null session      → not logged in, redirect to /auth
 * - valid session     → render children
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  if (session === undefined) return null; // loading
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

