import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ChatAssistant from "./pages/ChatAssistant";
import Dashboard from "./pages/Dashboard";
import FormReview from "./pages/FormReview";
import HomePage from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Register from "./pages/Register";

// Create a client for React Query
const queryClient = new QueryClient();

// Protected Route component with enhanced error handling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Add debugging logs
  useEffect(() => {
    console.log("Protected Route Path:", location.pathname);
    console.log("Auth State:", { user: !!user, loading });
  }, [location.pathname, user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL to redirect back after login
    console.log("Redirecting to login, attempted path:", location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

// Admin Route component with error handling
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Add debugging logs
  useEffect(() => {
    console.log("Admin Route Path:", location.pathname);
    console.log("Admin Auth State:", { user: !!user, isAdmin, loading });
  }, [location.pathname, user, isAdmin, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    console.log("Redirecting to dashboard (no admin access)");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Authentication listener that handles redirects
const AuthListener = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only handle authentication redirects when loading is complete
    if (!loading) {
      if (user) {
        // If user is at login or register, redirect to dashboard
        if (
          location.pathname === "/login" ||
          location.pathname === "/register"
        ) {
          console.log("User authenticated, redirecting to dashboard");
          navigate("/dashboard");
        }
      }
    }
  }, [user, loading, navigate, location.pathname]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AuthListener>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/not-found" element={<NotFound />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat-assistant"
                element={
                  <ProtectedRoute>
                    <ChatAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/form-review"
                element={
                  <ProtectedRoute>
                    <FormReview />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* 404 route - Make sure this is the last route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthListener>
        </Router>

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={4000}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
