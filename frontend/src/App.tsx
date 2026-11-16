import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { getToken } from "./api/client";
import {Login} from "./pages/Login";
import {Dashboard} from "./pages/Dashboard";
import Home from "./pages/Home";
import MatchDetail from "./pages/MatchDetail";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  if (!admin && !getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
