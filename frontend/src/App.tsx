import { BrowserRouter, Routes, Route } from "react-router";
import React from "react";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public-only: redirect to dashboard if already logged in */}
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />

        {/* OAuth callback — no guard needed, AuthCallback handles its own logic */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected: redirect to /auth if not logged in */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;